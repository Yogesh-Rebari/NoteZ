import React from 'react';

/**
 * Badge component for displaying status, categories, and labels
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-100 text-blue-800';
      case 'secondary':
        return 'bg-gray-100 text-gray-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-cyan-100 text-cyan-800';
      case 'purple':
        return 'bg-purple-100 text-purple-800';
      case 'pink':
        return 'bg-pink-100 text-pink-800';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

