import React, { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Users, ArrowRight } from 'lucide-react';
import TeamRegistration from './components/TeamRegistration';
import BingoGame from './components/BingoGame';
import Leaderboard from './components/Leaderboard';
import { Team, GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>('registration');
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [deviceId] = useState<string>(() => {
    // Generate a unique device ID or use existing one
    const existingId = localStorage.getItem('deviceId');
    if (existingId) return existingId;
    
    const newId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('deviceId', newId);
    return newId;
  });

  // Function to add a new team
  const addTeam = (teamName: string) => {
    const newTeam: Team = {
      id: `${deviceId}-${Date.now().toString()}`,
      name: teamName,
      score: 0,
      board: Array(25).fill({ answered: false, answer: '' }),
      completedLines: 0,
      deviceId: deviceId,
      timeRemaining: 600, // 10 minutes in seconds
      startTime: Date.now()
    };
    
    setTeams([...teams, newTeam]);
    setCurrentTeam(newTeam);
    
    // In a real app, you would sync this with a backend
    // For demo purposes, we'll use localStorage to simulate multi-device
    const allTeams = JSON.parse(localStorage.getItem('allTeams') || '[]');
    localStorage.setItem('allTeams', JSON.stringify([...allTeams, newTeam]));
  };

  // Function to update team score
  const updateTeamScore = (teamId: string, newScore: number, newBoard: any[], completedLines: number, timeRemaining: number) => {
    const updatedTeams = teams.map(team => 
      team.id === teamId 
        ? { ...team, score: newScore, board: newBoard, completedLines, timeRemaining } 
        : team
    );
    
    setTeams(updatedTeams);
    
    if (currentTeam && currentTeam.id === teamId) {
      setCurrentTeam({...currentTeam, score: newScore, board: newBoard, completedLines, timeRemaining});
    }
    
    // Update in localStorage to simulate multi-device sync
    const allTeams = JSON.parse(localStorage.getItem('allTeams') || '[]');
    const updatedAllTeams = allTeams.map((team: Team) => 
      team.id === teamId 
        ? { ...team, score: newScore, board: newBoard, completedLines, timeRemaining } 
        : team
    );
    localStorage.setItem('allTeams', JSON.stringify(updatedAllTeams));
  };

  // Function to finish the current team's turn
  const finishTurn = () => {
    setGameState('leaderboard');
  };

  // Function to start the game
  const startGame = () => {
    if (currentTeam) {
      setGameState('playing');
    } else {
      alert('Please register your team before starting the game.');
    }
  };

  // Simulate fetching all teams data (in a real app, this would be from a backend)
  useEffect(() => {
    const checkForUpdates = () => {
      const allTeams = JSON.parse(localStorage.getItem('allTeams') || '[]');
      setTeams(allTeams);
    };
    
    // Initial load
    checkForUpdates();
    
    // Set up polling to check for updates
    const interval = setInterval(checkForUpdates, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white">
      <header className="p-4 bg-black bg-opacity-30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Tech Bingo Challenge</h1>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {gameState === 'registration' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Team Registration</h2>
              </div>
              
              {!currentTeam ? (
                <TeamRegistration onAddTeam={addTeam} />
              ) : (
                <div className="bg-blue-800 bg-opacity-50 p-4 rounded-lg mb-4">
                  <p className="font-medium">Your team: <span className="font-bold">{currentTeam.name}</span></p>
                  <p className="text-sm mt-2">Ready to start the game!</p>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">All Registered Teams:</h3>
                {teams.length === 0 ? (
                  <p className="text-gray-300">No teams registered yet.</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {teams.map((team, index) => (
                      <li key={team.id} className={`bg-white bg-opacity-20 p-2 rounded flex justify-between items-center ${team.deviceId === deviceId ? 'border-2 border-white' : ''}`}>
                        <span>{team.name}</span>
                        <span className="text-xs bg-purple-700 px-2 py-1 rounded-full">Team {index + 1}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              {currentTeam && (
                <button
                  onClick={startGame}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-3 px-4 rounded-md transition-colors"
                >
                  Start Game <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {gameState === 'playing' && currentTeam && (
          <div>
            <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm shadow-xl mb-4">
              <h2 className="text-xl font-semibold mb-2">
                Team: {currentTeam.name}
              </h2>
              <p className="text-sm">
                Complete as many lines as you can to rack up points! Each fully completed line (whether horizontal, vertical, or diagonal) earns you 10 points.
              </p>
            </div>
            
            <BingoGame 
              team={currentTeam} 
              onUpdateScore={updateTeamScore}
              onFinish={finishTurn}
            />
          </div>
        )}

        {gameState === 'leaderboard' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <h2 className="text-2xl font-bold">Live Leaderboard</h2>
              </div>
              <Leaderboard teams={teams} currentDeviceId={deviceId} />
              <button
                onClick={() => setGameState('registration')}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 py-3 px-4 rounded-md transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 text-center text-sm text-gray-300 mt-auto">
        Tech Bingo Challenge © {new Date().getFullYear()} - A fun way to test your tech knowledge!
      </footer>
    </div>
  );
}

export default App;