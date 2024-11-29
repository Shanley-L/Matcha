# Matcha

1. **Inscription et Connexion :**

   - Création de compte avec email, nom d’utilisateur, nom de famille, prénom, et mot de passe sécurisé.
   - Envoi d’un email de vérification pour activer le compte.
   - Récupération de mot de passe par email en cas d’oubli.
   - Déconnexion en un clic de n’importe quelle page.

2. **Profil Utilisateur :**

   - Remplissage de profil (genre, préférences sexuelles, biographie, intérêts sous forme de tags, et jusqu’à 5 photos).
   - Modification de ces informations à tout moment.
   - Visualisation des personnes ayant consulté ou "liké" le profil de l’utilisateur.
   - Attribution d’un score de popularité (fame rating).

3. **Navigation et Suggestions :**

   - Suggestions de profils “intéressants” basés sur la localisation, intérêts communs et score de popularité.
   - Tri des résultats par âge, localisation, score de popularité et intérêts.
   - Filtrage avancé par critères spécifiques (ex. tranche d’âge, localisation, etc.).

4. **Profils d’Autres Utilisateurs :**

   - Visualisation des profils complets (sauf email et mot de passe).
   - Historique des visites.
   - Capacité d’envoyer un "like" pour se connecter (chat possible si les deux utilisateurs ont “liké” le profil de l’autre).
   - Signalement de profils suspects et blocage d’utilisateurs.

5. **Chat :**

   - Chat en temps réel avec les utilisateurs connectés.
   - Notification instantanée des nouveaux messages depuis n’importe quelle page.

6. **Notifications :**

   - Notifications en temps réel pour les “likes” reçus, visites de profil, messages reçus, et autres interactions.

7. **Sécurité et Validation :**

   - Validation et sécurisation des formulaires.
   - Pas de mots de passe en texte clair ni de failles SQL ou XSS.
   - Stockage sécurisé des informations sensibles (ex. dans un fichier .env).

8. **Partie Bonus (Optionnel) :**
   - Authentification via réseaux sociaux.
   - Importation de photos depuis les réseaux sociaux.
   - Localisation GPS avancée et carte interactive des utilisateurs.
   - Intégration de chat audio ou vidéo, ou d’une fonctionnalité de planification de rencontres.

### To-Do List Technique

1. **Backend :** Symfony (PHP) est un excellent choix pour structurer un backend robuste et sécurisé.
2. **Frontend :** React(js)
3. **Base de Données :** MySQL 
