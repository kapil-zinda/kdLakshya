import Box from "@/components/box/box";
import TodoDashboard from "@/components/dashboard/TodoDashboard";

const Home = () => {
  return (
    <div className="mb-8">
      <div className="max-w-screen-xl mx-auto py-3">
        <h2 className="text-2xl font-bold tracking-tight">Welcome to 10k Hours</h2>
        <p className="text-muted-foreground">
          Simplify your task management with ease and efficiency.
        </p>
      </div>
      <div className="max-w-screen-xl mx-auto">
        {/* <Box /> */}
        <TodoDashboard />
      </div>
    </div>
  );
};
export default Home;
