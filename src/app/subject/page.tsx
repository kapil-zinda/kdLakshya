import AllQuestionSpace from "../../components/roundPageView/roundPageView";
import SubjectCard from "@/components/cards/subjectCard";

// export const metadata: Metadata = {
//   title: "10k Hours - Task and Issue Tracker",
//   description:
//     "Efficiently manage tasks and track issues with iTasks, your dedicated task and issue tracker.",
// };

export default function SubjectPage() {
    const subjectdata = {
        "id":"subject3",
        "name":"physics",
        "parent":"subject1",
        "completed_page":5,
        "total_page":12,
        "inner_subject":[{"name":"kinetics", "id":"12345"}],
        "page_array":[3,2,1,0,1,2,3,1,2,2,0,1,2,2,3],
        "page_dates":[["12","15"],["4"],["7","9","28"],[],["12","15"],["4"],["7","9","28"],[],["12","15"],["4"],["7","9","28"],[],]
    }
  return (
    <>
    <main className="mb-8">
      <div className="max-w-screen-xl mx-auto py-3">
        <h2 className="text-2xl font-bold tracking-tight">{subjectdata.name}</h2>
        <p className="text-muted-foreground">
          Simplify your task management with ease and efficiency.
        </p>
      </div>
      <div className="max-w-screen-xl mx-auto">
      <div className="p-4 border-2 rounded-lg ">
        {subjectdata.inner_subject.map((subject_dd:any, index:number) => {
          return (
            <div key={index}>
            <SubjectCard name={subject_dd.name} id={String(subject_dd.id)}/>
            </div>
          );
        })}
      </div>
      {/* {subjectdata.inner_subject.length > 0 && (<div id="subjectListHome" className="p-4 border-2 rounded-lg ">
        {(subjectdata.inner_subject as any).map((name:string, id:string, index:number) => {
          return (
             <SubjectCard key={index} name={name} id={String(id)}/>
          );
        })}
      </div>)} */}
      <AllQuestionSpace
                question={subjectdata.page_array}
                total={subjectdata.total_page}
              />
      </div>
    </main>
    </>
  );
}
