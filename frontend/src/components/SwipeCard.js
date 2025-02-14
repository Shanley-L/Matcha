import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import '../styles/components/SwipeCard.css';

const SwipeCard = ({ user, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      const swipeOutX = info.offset.x > 0 ? 1000 : -1000;
      x.set(swipeOutX);
      setTimeout(() => {
        onSwipe(direction, user.id);
      }, 200);
    } else {
      x.set(0);
    }
  };
  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const userAge = calculateAge(user.birthdate);
  const photos = typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos;
  const firstPhoto = photos && photos.length > 0 
    ? `/shared/uploads/${photos[0]}` 
    : '/default-avatar.png';

  return (
    <motion.div
      className="swipe-card"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="card-image"
        style={{ backgroundImage: `url(${firstPhoto})` }}
      >
        <div className="card-info">
          <h2 className="card-name">{user.firstname}, {userAge || '?'}</h2>
          {user.job && <p className="card-bio">{user.job}</p>}
          {user.bio && <p className="card-bio">{user.bio}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard; 