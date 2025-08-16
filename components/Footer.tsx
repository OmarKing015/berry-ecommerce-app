import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Mazagk</h3>
            <p className="text-gray-400">Wear Your Mood</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul>
              <li>
                <Link href="/about-us" className="text-gray-400 hover:text               Link href="/shipping-policy" className="text-gray-400 hover:text-white">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-400 hover:text-white">
                  Refund Policy
                </Link>
              </li>
              <li>
 </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <p className="text-gray-400">Email: yebrahim086@gmail.com</p>
            <p className="text-gray-400">Phone Number: +201204167144</p>
            <p className="text-gray-400">Address: Victoria Alexandria Egypt</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Developer</h3>
            <a
              href="https://wh.ms/201223606997"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white underline"
            >
              Eng/Omar Osama
            </a>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8 pt-8 border-t border-gray-700">
          <p>&copy; {new Date().getFullYear()} Mazagk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;