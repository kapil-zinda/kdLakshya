'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

import UserGroupModal from './UserGroupModal';

interface Team {
  id: number;
  name: string;
  description: string;
}

const TeamsPage: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teams: Team[] = [
    {
      id: 1,
      name: 'modern history',
      description: 'can put desc here',
    },
    {
      id: 2,
      name: 'modern history spectrum',
      description: 'can put desc here',
    },
    {
      id: 3,
      name: 'hindi',
      description: 'can put desc here',
    },
  ];

  const handleOpenModal = (teamId: number) => {
    setSelectedTeam(teamId);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>

      <div className="grid gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {team.name}
                </h2>
                <p className="text-gray-400">{team.description}</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleOpenModal(team.id)}>
                    Manage Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {selectedTeam && (
        <UserGroupModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      )}
    </div>
  );
};

export default TeamsPage;
