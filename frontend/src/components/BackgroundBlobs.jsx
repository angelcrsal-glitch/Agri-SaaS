import React from 'react';
import { motion } from 'framer-motion';

const BackgroundBlobs = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Blob 1 - Green Energy */}
            <motion.div
                animate={{
                    x: [0, 100, -50, 0],
                    y: [0, -50, 100, 0],
                    scale: [1, 1.2, 0.9, 1]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, rgba(0,0,0,0) 70%)',
                    willChange: 'transform'
                }}
            />
            {/* Blob 2 - Deep Blue */}
            <motion.div
                animate={{
                    x: [0, -70, 30, 0],
                    y: [0, 80, -40, 0],
                    scale: [1, 1.1, 0.95, 1]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "linear"
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(30,58,138,0.4) 0%, rgba(0,0,0,0) 70%)',
                    willChange: 'transform'
                }}
            />
        </div>
    );
};
export default BackgroundBlobs;
