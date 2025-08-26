import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ForgotPasswordModal = ({ isOpen, onRequestClose, showNotification }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/users/forgotpassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showNotification(data.message);
            onRequestClose();
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Forgot Password"
            className="bg-gray-800 text-white rounded-lg shadow-xl max-w-md w-11/12 mx-auto my-12 p-8 border border-gray-700 relative"
            overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        >
            <h2 className="text-2xl font-bold text-white mb-4">Forgot Password</h2>
            <p className="text-gray-400 mb-6">Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 rounded-md"
                    required
                />
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={onRequestClose} className="py-2 px-4 bg-gray-600 rounded-md hover:bg-gray-500">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="py-2 px-4 bg-amber-600 rounded-md hover:bg-amber-500 disabled:bg-gray-500">
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ForgotPasswordModal;
