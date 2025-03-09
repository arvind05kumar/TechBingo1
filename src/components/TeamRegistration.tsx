import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

interface TeamRegistrationProps {
  onAddTeam: (teamName: string) => void;
}

const TeamRegistration: React.FC<TeamRegistrationProps> = ({ onAddTeam }) => {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onAddTeam(teamName.trim());
      setTeamName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium mb-1">
          Team Name
        </label>
        <input
          type="text"
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-4 py-2 bg-white bg-opacity-20 border border-gray-300 border-opacity-20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          placeholder="Enter your team name"
          required
        />
      </div>
      <button
        type="submit"
        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Register Team
      </button>
    </form>
  );
};

export default TeamRegistration;