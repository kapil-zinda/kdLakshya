import React from "react";

type SubjectCardProps = {
	name:string,
    id: string,
};

const SubjectCard:React.FC<SubjectCardProps> = ({name, id}) => {
  return (
    <div
      className="p-6 rounded-lg shadow bg-gray-800 border-gray-700"
      id="subjectCardHome"
    >
      <a href="#">
        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-white border-gray-200">
          {name}
        </h5>
      </a>
      <p className="mb-3 font-normal text-gray-400">
        can put desc here
      </p>
    </div>
  );
};

export default SubjectCard;