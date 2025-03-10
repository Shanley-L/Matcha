const GetLocation = () => {
    
    const location = {
        town: '',
        neighbourhood: ''
    };
    // Fonction pour récupérer la localisation par IP
    const getLocationByIP = async () => {
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            const preciseLocation = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}`);
            const preciseLocationData = await preciseLocation.json();
            
            if (preciseLocationData.address) {
                location.town = preciseLocationData.address.town;
                location.neighbourhood = preciseLocationData.address.neighbourhood;
            } else {
                location.town = 'Localisation inconnue';
                location.neighbourhood = 'Localisation inconnue';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de la localisation IP:', error);
            location.town = 'Localisation indisponible';
            location.neighbourhood = 'Localisation indisponible';
        }
    };

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        location.town = data.address.town;
                        location.neighbourhood = data.address.neighbourhood;
                    } catch (error) {
                        console.error('Erreur lors de la récupération de la localisation GPS:', error);
                        getLocationByIP(); // Si échec, on passe à la localisation par IP
                    }
                },
                () => {
                    console.warn('L\'utilisateur a refusé la localisation GPS.');
                    getLocationByIP(); // Si refus, on récupère la localisation par IP
                }
            );
        } else {
            getLocationByIP(); // Si le navigateur ne supporte pas la géolocalisation
        }
    };

    getUserLocation();

    return (location);
};

export default GetLocation;