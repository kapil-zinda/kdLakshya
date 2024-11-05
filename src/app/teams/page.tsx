'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { makeApiCall } from '@/utils/ApiRequest';
import { MoreVertical } from 'lucide-react';

import UserGroupModal from './UserGroupModal';

interface TeamPermission {
  [email: string]: string; // Key is an email, value is the permission level (e.g., "manage")
}

type TeamAttributes = {
  name: string;
  description: string;
  created_ts: number;
  modified_ts: number;
  is_active: boolean;
  permission: TeamPermission;
  key_id: string;
  org: string;
  id: string;
};

type TeamData = {
  type: string;
  id: string;
  attributes: TeamAttributes;
  links?: {
    self?: string;
  };
};

const TeamsPage: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teams, setTeams] = useState<TeamData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await makeApiCall({
          path: `auth/organizations/{org_id}/teams`,
          method: 'GET',
        });
        setTeams(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (teamId: string, team_name: string) => {
    setSelectedTeam(teamId);
    setSelectedTeamName(team_name);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>

      <div className="grid gap-4">
        {teams.map((team) => (
          <a
            key={team.id}
            href={`/teams/${team.id}`}
            className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {team.attributes.name}
                </h2>
                <p className="text-gray-400">{team.attributes.description}</p>
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
                  <DropdownMenuItem
                    onClick={() =>
                      handleOpenModal(team.id, team.attributes.name)
                    }
                  >
                    Manage Team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </a>
        ))}
      </div>

      {selectedTeam && selectedTeamName && (
        <UserGroupModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          team_id={selectedTeam}
          team_name={selectedTeamName}
        />
      )}
    </div>
  );
};

export default TeamsPage;
