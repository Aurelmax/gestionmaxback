/**
 * Payload CMS 3.x API Route Handler
 *
 * Ce fichier gère tous les endpoints de l'API Payload:
 * - /api/* (REST endpoints pour toutes les collections)
 * - /api/graphql (GraphQL endpoint)
 * - /api/creer-apprenant (Custom endpoint)
 */

import { handlePayloadRequest } from '@payloadcms/next/routes'

export const dynamic = 'force-dynamic' // Important pour les requêtes dynamiques

export {
  handlePayloadRequest as GET,
  handlePayloadRequest as POST,
  handlePayloadRequest as PATCH,
  handlePayloadRequest as DELETE,
}
