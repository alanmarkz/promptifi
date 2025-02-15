import Home from "./_components/home";
import Navbar from "./_components/Navbar";

const pages = () => {
  return (
    <div className="flex flex-col">
      <Navbar></Navbar>
      <Home />
    </div>
  );
};

export default pages;
