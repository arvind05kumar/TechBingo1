import React from 'react';
import { Team } from '../types';

interface LeaderboardProps {
  teams: Team[];
  currentDeviceId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams, currentDeviceId }) => {
  // Sort teams by score (highest first)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate time used (10 minutes - time remaining)
  const calculateTimeUsed = (timeRemaining: number): string => {
    const timeUsed = 600 - timeRemaining;
    return formatTime(timeUsed);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black bg-opacity-30">
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">Completed Lines</th>
              <th className="px-4 py-3 text-center">Time Used</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr 
                key={team.id} 
                className={`${
                  team.deviceId === currentDeviceId 
                    ? 'bg-blue-700 bg-opacity-30 font-bold' 
                    : index === 0 
                    ? 'bg-yellow-500 bg-opacity-20' 
                    : index === 1 
                    ? 'bg-gray-400 bg-opacity-20' 
                    : index === 2 
                    ? 'bg-amber-700 bg-opacity-20' 
                    : index % 2 === 0 
                    ? 'bg-white bg-opacity-5' 
                    : 'bg-white bg-opacity-10'
                }`}
              >
                <td className="px-4 py-3">
                  {index === 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-black rounded-full font-bold">1</span>
                  ) : index === 1 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-400 text-black rounded-full font-bold">2</span>
                  ) : index === 2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-700 text-white rounded-full font-bold">3</span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-700 rounded-full">{index + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {team.name}
                  {team.deviceId === currentDeviceId && (
                    <span className="ml-2 text-xs bg-purple-700 px-2 py-0.5 rounded-full">You</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{team.completedLines}</td>
                <td className="px-4 py-3 text-center">{calculateTimeUsed(team.timeRemaining)}</td>
                <td className="px-4 py-3 text-right font-bold">{team.score}</td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-3 text-center text-gray-400">
                  No teams have played yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;