import React, { useState, useEffect } from 'react';
import { Check, Award } from 'lucide-react';
import { Team, BingoCell, BingoQuestion } from '../types';
import { bingoQuestions } from '../data/questions';

interface BingoGameProps {
  team: Team;
  onUpdateScore: (teamId: string, score: number, board: BingoCell[], completedLines: number, timeRemaining: number) => void;
  onFinish: () => void;
}

const BingoGame: React.FC<BingoGameProps> = ({ team, onUpdateScore, onFinish }) => {
  const [board, setBoard] = useState<BingoCell[]>(team.board);
  const [questions, setQuestions] = useState<BingoQuestion[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [completedLines, setCompletedLines] = useState(team.completedLines);
  const [score, setScore] = useState(team.score);
  const [timeLeft, setTimeLeft] = useState(team.timeRemaining || 600); // 10 minutes in seconds
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Initialize the board with questions
  useEffect(() => {
    // Get the shared questions from localStorage or create new ones
    const storedQuestions = localStorage.getItem('bingoQuestions');
    
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    } else {
      // Shuffle questions and take 25
      const shuffled = [...bingoQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 25).map((q, index) => ({
        ...q,
        position: index
      }));
      
      // Store in localStorage so all devices get the same questions
      localStorage.setItem('bingoQuestions', JSON.stringify(selectedQuestions));
      setQuestions(selectedQuestions);
    }
    
    // Mark the center as answered (free space)
    if (!board[12].answered) {
      const newBoard = [...board];
      newBoard[12] = { answered: true, answer: 'FREE SPACE' };
      setBoard(newBoard);
      onUpdateScore(team.id, score, newBoard, completedLines, timeLeft);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
      onUpdateScore(team.id, score, board, completedLines, timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Check for completed lines whenever the board changes
  useEffect(() => {
    const newCompletedLines = checkCompletedLines(board);
    if (newCompletedLines > completedLines) {
      const newScore = newCompletedLines * 10;
      setCompletedLines(newCompletedLines);
      setScore(newScore);
      onUpdateScore(team.id, newScore, board, newCompletedLines, timeLeft);
    }
    
    // Check if all questions are answered
    const answeredCount = board.filter(cell => cell.answered).length;
    if (answeredCount === 25) {
      setAllQuestionsAnswered(true);
    }
  }, [board]);

  // Check for completed lines (horizontal, vertical, diagonal)
  const checkCompletedLines = (board: BingoCell[]): number => {
    let lines = 0;

    // Check horizontal lines
    for (let row = 0; row < 5; row++) {
      let completed = true;
      for (let col = 0; col < 5; col++) {
        if (!board[row * 5 + col].answered) {
          completed = false;
          break;
        }
      }
      if (completed) lines++;
    }

    // Check vertical lines
    for (let col = 0; col < 5; col++) {
      let completed = true;
      for (let row = 0; row < 5; row++) {
        if (!board[row * 5 + col].answered) {
          completed = false;
          break;
        }
      }
      if (completed) lines++;
    }

    // Check diagonal (top-left to bottom-right)
    let completed = true;
    for (let i = 0; i < 5; i++) {
      if (!board[i * 5 + i].answered) {
        completed = false;
        break;
      }
    }
    if (completed) lines++;

    // Check diagonal (top-right to bottom-left)
    completed = true;
    for (let i = 0; i < 5; i++) {
      if (!board[i * 5 + (4 - i)].answered) {
        completed = false;
        break;
      }
    }
    if (completed) lines++;

    return lines;
  };

  const handleCellClick = (index: number) => {
    if (!board[index].answered) {
      setSelectedCell(index);
    }
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCell !== null && answer.trim()) {
      const newBoard = [...board];
      newBoard[selectedCell] = { answered: true, answer: answer.trim() };
      setBoard(newBoard);
      setSelectedCell(null);
      setAnswer('');
      onUpdateScore(team.id, score, newBoard, completedLines, timeLeft);
    }
  };

  const handleFinish = () => {
    onUpdateScore(team.id, score, board, completedLines, timeLeft);
    onFinish();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-800 bg-opacity-50 px-4 py-2 rounded-md">
          <span className="font-medium">Score: </span>
          <span className="font-bold text-xl">{score}</span>
        </div>
        <div className="bg-red-800 bg-opacity-50 px-4 py-2 rounded-md">
          <span className="font-medium">Time Left: </span>
          <span className="font-bold text-xl">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            onClick={() => handleCellClick(index)}
            className={`aspect-square p-2 rounded-md cursor-pointer transition-all transform hover:scale-105 ${
              board[index].answered
                ? 'bg-green-600 bg-opacity-70'
                : selectedCell === index
                ? 'bg-blue-600 bg-opacity-70 ring-2 ring-white'
                : 'bg-gray-800 bg-opacity-70 hover:bg-gray-700'
            }`}
          >
            <div className="h-full flex flex-col">
              <div className="text-xs font-bold mb-1">
                {Math.floor(index / 5) === 2 && index % 5 === 2 ? 'FREE SPACE' : `Task ${index + 1}`}
              </div>
              <div className="flex-grow text-xs overflow-auto">
                {Math.floor(index / 5) === 2 && index % 5 === 2 ? (
                  <div className="h-full flex items-center justify-center">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                ) : (
                  question.question
                )}
              </div>
              {board[index].answered && (
                <div className="mt-1 text-xs bg-black bg-opacity-30 p-1 rounded">
                  <span className="font-bold">Ans:</span> {board[index].answer}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedCell !== null && selectedCell !== 12 && (
        <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm shadow-xl mb-4">
          <h3 className="font-medium mb-2">
            Answer for: {questions[selectedCell]?.question}
          </h3>
          <form onSubmit={handleAnswerSubmit} className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-grow px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              placeholder="Type your answer here"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
            >
              Submit
            </button>
          </form>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleFinish}
          disabled={timeLeft > 0 && !allQuestionsAnswered}
          className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
            timeLeft <= 0 || allQuestionsAnswered
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <Award className="h-5 w-5" />
          {timeLeft <= 0 ? 'Time\'s Up!' : allQuestionsAnswered ? 'All Complete!' : 'Finish Turn'}
        </button>
      </div>
      
      {timeLeft > 0 && !allQuestionsAnswered && (
        <p className="text-center text-sm text-gray-300 mt-2">
          You can only finish when time runs out or all questions are answered.
        </p>
      )}
    </div>
  );
};

export default BingoGame;