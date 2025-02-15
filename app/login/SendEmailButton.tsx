import { useState } from 'react';

export default function SendEmailButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setMessage(null); // Clear previous messages

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com', // Replace with the actual email
          firstName: 'John', // Replace with the actual first name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Welcome email sent successfully!');
      } else {
        setMessage(data.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred while sending the email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={handleClick}
        className="py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        disabled={isLoading}
      >
        {isLoading ? 'Sending email...' : 'Send Welcome Email'}
      </button>

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
