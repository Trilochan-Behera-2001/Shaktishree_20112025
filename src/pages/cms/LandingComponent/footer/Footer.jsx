import shaktiLogo from "../../../../assets/images/shaktiLogo.png";

const Footer = () => {
  return (
    <footer className="bg-black text-white">

      <div className="flex flex-col md:flex-row justify-between items-center px-12 py-2 border-b border-gray-800">
    
        <div className="flex items-center space-x-2">
          <img src={shaktiLogo} alt="Shakti Logo" className="h-12" />
        </div>

        <ul className="flex space-x-6 text-sm mt-2 md:mt-0">
          <li>
            <a href="#" className="hover:text-gray-400 transition">
              HOME
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-400 transition">
              HIMS
            </a>
          </li>
        </ul>
      </div>

      <div className="text-center text-black text-[16px] py-2 bg-white font-lato">
        © All Rights Reserved. Shatishree. Developed by Aashdit.
      </div>
    </footer>
  );
};

export default Footer;