
import React from 'react';

interface SpinnerProps {
    message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white"></div>
      <p className="text-xl text-gray-300">{message}</p>
    </div>
  );
};

export default Spinner;