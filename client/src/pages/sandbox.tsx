import React from 'react';

const Sandbox: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-primary text-3xl font-bold">Sandbox Page</h1>
      <p className="text-secondary mt-2">This is a sandbox page to test Tailwind CSS styles.</p>
      <div className="bg-accent p-4 mt-4 rounded">
        <p className="text-white">Accent background with white text.</p>
      </div>
      <div className="bg-gray p-4 mt-4 rounded">
        <p className="text-black">Gray background with black text.</p>
      </div>
      <div className="bg-auxiliary p-4 mt-4 rounded">
        <p className="text-white">Auxiliary background with white text.</p>
      </div>
    </div>
  );
};

export default Sandbox; 