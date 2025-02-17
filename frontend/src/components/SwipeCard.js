import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaRedo } from 'react-icons/fa';
import PhotoModal from './PhotoModal';
import '../styles/components/SwipeCard.css';

const SwipeCard = ({ user, onSwipe }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
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

  const handleFlip = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handlePhotoClick = (photo) => {
    if (photo.startsWith('/shared/uploads/')) {
      setSelectedPhoto(photo);
    } else {
      setSelectedPhoto(`/shared/uploads/${photo}`);
    }
  };

  const userAge = calculateAge(user.birthdate);
  const photos = typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos;
  const firstPhoto = photos && photos.length > 0 
    ? `/shared/uploads/${photos[0]}` 
    : '/default-avatar.png';
  
  const createProfileSections = () => {
    const sections = [];
    const remainingPhotos = photos ? photos.slice(1) : [];

    // Create content sections
    const contentSections = [];
    if (user.bio) {
      contentSections.push({
        key: 'bio',
        content: (
          <div className="profile-section">
            <h3>About Me</h3>
            <p>{user.bio}</p>
          </div>
        )
      });
    }

    if (user.job) {
      contentSections.push({
        key: 'job',
        content: (
          <div className="profile-section">
            <h3>Occupation</h3>
            <p>{user.job}</p>
          </div>
        )
      });
    }

    if (user.interests) {
      contentSections.push({
        key: 'interests',
        content: (
          <div className="profile-section">
            <h3>Interests</h3>
            <div className="interests-list">
              {(typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests).map((interest, index) => (
                <span key={index} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )
      });
    }

    if (user.country) {
      contentSections.push({
        key: 'location',
        content: (
          <div className="profile-section">
            <h3>Location</h3>
            <p>{user.country}</p>
          </div>
        )
      });
    }

    // Interleave content sections with photos
    contentSections.forEach((section, index) => {
      sections.push(section.content);
      if (remainingPhotos[index]) {
        sections.push(
          <div 
            key={`photo-${index}`}
            className="profile-photo"
            style={{ 
              backgroundImage: `url(/shared/uploads/${remainingPhotos[index]})`
            }}
            onClick={() => handlePhotoClick(remainingPhotos[index])}
          />
        );
      }
    });

    // Add any remaining photos at the end
    if (remainingPhotos.length > contentSections.length) {
      remainingPhotos.slice(contentSections.length).forEach((photo, index) => {
        sections.push(
          <div 
            key={`extra-photo-${index}`}
            className="profile-photo"
            style={{ 
              backgroundImage: `url(/shared/uploads/${photo})`
            }}
            onClick={() => handlePhotoClick(photo)}
          />
        );
      });
    }

    return sections;
  };

  return (
    <>
      <motion.div
        className="swipe-card"
        drag={!isFlipped ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate: isFlipped ? 0 : rotate, opacity }}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
          {/* Front of the card */}
          <div className="card-front">
            <div 
              className="card-image"
              style={{ backgroundImage: `url(${firstPhoto})` }}
              onClick={() => handlePhotoClick(photos[0])}
            >
              <div className="flip-button" onClick={handleFlip}>
                <FaRedo />
              </div>
              <div className="card-info">
                <h2 className="card-name">{user.firstname}, {userAge || '?'}</h2>
                {user.job && <p className="card-bio">{user.job}</p>}
              </div>
            </div>
          </div>

          {/* Back of the card */}
          <div className="card-back">
            <div className="flip-button" onClick={handleFlip}>
              <FaRedo style={{ transform: 'scaleX(-1)' }} />
            </div>
            <div className="profile-details">
              <h2>{user.firstname}'s Profile</h2>
              <div className="profile-content">
                {createProfileSections()}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <PhotoModal 
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
};

export default SwipeCard; 