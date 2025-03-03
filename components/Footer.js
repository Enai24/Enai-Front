import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-light text-center text-lg-start mt-5">
      <div className="text-center p-3">
        © {new Date().getFullYear()} Enai. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;