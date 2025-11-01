/**
 * GraphQL Endpoint pour mode Headless
 *
 * En mode headless (admin.disable: true), GraphQL doit être configuré manuellement
 */

import { createHandler } from 'graphql-http/lib/use/fetch'
import { configToSchema } from '@payloadcms/graphql'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

let graphqlHandler: ((req: Request) => Promise<Response>) | null = null

async function getGraphQLHandler() {
  if (!graphqlHandler) {
    const payload = await getPayloadHMR({ config })
    const { schema } = configToSchema(payload.config)

    graphqlHandler = createHandler({
      schema,
      context: async (req) => ({
        req,
        payload,
        user: req.headers.get('payload-user') ? JSON.parse(req.headers.get('payload-user')!) : null,
      }),
    })
  }
  return graphqlHandler
}

export async function POST(request: Request) {
  try {
    const handler = await getGraphQLHandler()
    return await handler(request)
  } catch (error) {
    console.error('❌ GraphQL Error:', error)
    return Response.json(
      {
        errors: [{
          message: error instanceof Error ? error.message : 'Internal server error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        }]
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return Response.json({
    message: 'GraphQL endpoint is active',
    info: 'Send POST requests with GraphQL queries',
    example: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { query: '{ __typename }' },
    },
  })
}
