/**
 * GestionMax Backend API
 *
 * Page d'accueil du backend - affiche les informations de l'API
 */

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '50px auto',
      padding: '20px',
      lineHeight: '1.6'
    }}>
      <h1>🚀 GestionMax Backend API</h1>
      <p>Backend API Payload CMS 3.x pour GestionMax Formation</p>

      <h2>📍 Endpoints disponibles:</h2>
      <ul>
        <li>
          <strong>REST API:</strong>{' '}
          <a href={`${apiUrl}/api`} target="_blank" rel="noopener noreferrer">
            {apiUrl}/api
          </a>
        </li>
        <li>
          <strong>GraphQL:</strong>{' '}
          <a href={`${apiUrl}/api/graphql`} target="_blank" rel="noopener noreferrer">
            {apiUrl}/api/graphql
          </a>
        </li>
      </ul>

      <h2>📚 Collections:</h2>
      <ul>
        <li>/api/users - Utilisateurs</li>
        <li>/api/formations - Formations catalogue</li>
        <li>/api/formations_personnalisees - Formations personnalisées</li>
        <li>/api/structures-juridiques - Structures juridiques</li>
        <li>/api/apprenants - Apprenants</li>
        <li>/api/articles - Articles de blog</li>
        <li>/api/categories - Catégories</li>
        <li>/api/tags - Tags</li>
        <li>/api/programmes - Programmes de formation</li>
        <li>/api/rendez-vous - Rendez-vous</li>
        <li>/api/contacts - Contacts</li>
        <li>/api/media - Médias</li>
      </ul>

      <h2>🔧 Custom Endpoints:</h2>
      <ul>
        <li>POST /api/creer-apprenant - Créer un apprenant avec structure</li>
      </ul>

      <p style={{ marginTop: '40px', color: '#666', fontSize: '14px' }}>
        Environment: {process.env.NODE_ENV || 'development'}
      </p>
    </div>
  )
}
