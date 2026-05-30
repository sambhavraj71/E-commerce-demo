import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      <Link to="/" className="hover:text-black">Home</Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FiChevronRight size={14} />
          {item.path ? (
            <Link to={item.path} className="hover:text-black">
              {item.name}
            </Link>
          ) : (
            <span className="text-black">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;