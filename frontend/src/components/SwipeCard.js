import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { FaRedo } from 'react-icons/fa';
import { IoLocationOutline } from 'react-icons/io5';
import PhotoModal from './PhotoModal';
import '../styles/components/SwipeCard.css';

const SwipeCard = ({ user, onSwipe }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      const swipeOutX = info.offset.x > 0 ? 2000 : -2000;
      x.set(swipeOutX);
      setTimeout(() => {
        onSwipe(direction, user.id);
      }, 200);
    } else {
      x.set(0);
    }
    // Reset dragging state after a short delay to prevent click event from firing
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
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
    if (isDragging) return;
    if (photo.startsWith('/shared/uploads')) {
      setSelectedPhoto(photo);
    } else {
      setSelectedPhoto(`/shared/uploads${photo}`);
    }
  };

  const userAge = calculateAge(user.birthdate);
  const photos = typeof user.photos === 'string' ? JSON.parse(user.photos) : user.photos;
  const firstPhoto = photos && photos.length > 0 
    ? `/shared/uploads${photos[0]}` 
    : '/default-avatar.png';
  
  const createProfileSections = () => {
    const sections = [];
    const remainingPhotos = photos ? photos.slice(1) : [];
    const contentSections = [];
    if (user.bio) {
      contentSections.push({
        key: 'bio',
        content: (
          <div key="bio-section" className="profile-section">
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
          <div key="job-section" className="profile-section">
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
          <div key="interests-section" className="profile-section">
            <h3>Interests</h3>
            <div className="interests-list">
              {(typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests).map((interest, index) => (
                <span key={`interest-${index}`} className="interest-tag">{interest}</span>
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
          <div key="location-section" className="profile-section">
            <h3>Location</h3>
            <p>{user.country}</p>
          </div>
        )
      });
    }

    contentSections.forEach((section, index) => {
      sections.push(
        <div key={`section-${section.key}`}>
          {section.content}
        </div>
      );
      if (remainingPhotos[index]) {
        sections.push(
          <div 
            key={`photo-section-${index}`}
            className="profile-photo"
            style={{ 
              backgroundImage: `url(/shared/uploads/${remainingPhotos[index]})`
            }}
            onClick={() => handlePhotoClick(remainingPhotos[index])}
          />
        );
      }
    });

    if (remainingPhotos.length > contentSections.length) {
      remainingPhotos.slice(contentSections.length).forEach((photo, index) => {
        sections.push(
          <div 
            key={`extra-photo-section-${index}`}
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
        onDragStart={handleDragStart}
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
                {typeof user.distance_km === 'number' && (
                  <p className="card-distance">
                    <IoLocationOutline />
                    {user.distance_km} km away
                  </p>
                )}
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