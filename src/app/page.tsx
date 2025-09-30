import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Home = () => {
  return (
    <div className="flex flex-col gap-y-4 w-full justify-center items-center h-full">
      Home
      <Button>Primary</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="secondary">sec</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="muted">Muted</Button>
      <Button variant="teritary">tetrer</Button>
      <Button
        variant="teritary"
        disabled
      >
        tetrer
      </Button>
      <Input />
    </div>
  );
};

export default Home;
