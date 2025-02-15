import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  return (
    <div className="w-full flex justify-between items-center p-4 fixed">
      <div>Sonic DeFAI</div>
      <div className="">
        <ConnectButton></ConnectButton>
      </div>
    </div>
  );
};

export default Navbar;
