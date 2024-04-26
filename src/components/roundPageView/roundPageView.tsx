type AllRoundPageProps = {
    question: any;
    total: number;
  };
  
  const allRoundSpace: React.FC<AllRoundPageProps> = ({
    question,
    total,
  }) => {
    return (
      <>   
        <div className="flex flex-wrap m-12 w-auto">
          {question.map((option: any, index: number) => {
            return (
              <button
                key={index}
                className={` ${
                  option === 3
                    ? "bg-green-800"
                    : option === 2
                    ? "bg-green-400"
                    : option === 1
                    ? "bg-violet-700"
                    :"bg-white"
                }  w-12 h-12 rounded-full text-black p-2 m-5 border-4 border-indigo-500/75 `}
                //   dangerouslySetInnerHTML={{
                //     __html: answer,
                //   }}
                value={index}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 text-center justify-center mb-12">
          <div className="flex mt-5">
            <button
              className={`bg-white  w-12 h-12 rounded-full text-black p-2 border-4 border-indigo-500/75 `}
            >
              Q
            </button>
            <p className="ml-10"><strong>Not Opened</strong></p>
          </div>
          <div className="flex mt-5">
            <button
              className={`bg-violet-700  w-12 h-12 rounded-full text-black p-2 border-4 border-indigo-500/75 `}
            >
              Q
            </button>
            <p className="ml-10"><strong>1 time studied</strong></p>
          </div>
          <div className="flex mt-5">
            <button
              className={`bg-green-400  w-12 h-12 rounded-full text-black p-2 border-4 border-indigo-500/75 `}
            >
              Q
            </button>
            <p className="ml-10"><strong>2 time studied</strong></p>
          </div>
          <div className="flex mt-5">
            <button
              className={`bg-green-800  w-12 h-12 rounded-full text-black p-2 border-4 border-indigo-500/75 `}
            >
              Q
            </button>
            <p className="ml-10"><strong>3 time studied</strong></p>
          </div>
        </div>
      </>
    );
  };
  
  export default allRoundSpace;