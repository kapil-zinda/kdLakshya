import type { NextPage } from "next";
import AddChallenges from "./components/add-challenges";
import Challenges from "./challenges";

const ChallengesPage: NextPage = () => {
  return (
    <div>
      <div className="max-w-screen-xl mx-auto py-3">
        <h1>Challenges</h1>
        <AddChallenges />
        <Challenges/>
      </div>
    </div>
  );
};

export default ChallengesPage;
