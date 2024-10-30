import React from 'react';

import { useRouter } from 'next/navigation';

type SubjectCardProps = {
  name: string;
  id: string;
  source: string;
};

const SubjectCard: React.FC<SubjectCardProps> = ({ name, id, source }) => {
  const router = useRouter();
  const handleCall = async () => {
    router.push(`/${source}/${id}/`);
  };
  return (
    <div
      className="pl-6 pb-2 pt-2 rounded-lg shadow bg-gray-800 border-gray-700"
      id="subjectCardHome"
    >
      <a href="#" onClick={handleCall}>
        <h5 className="mb-1 text-2xl font-semibold tracking-tight text-white border-gray-200">
          {name}
        </h5>
      </a>
      <p className="mb-3 font-normal text-gray-400">can put desc here</p>
    </div>
  );
};

export default SubjectCard;
