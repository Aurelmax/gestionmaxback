import type { PayloadHandler } from 'payload'

interface ApprenantData {
  nom: string
  prenom: string
  email: string
  siret: string
  telephone?: string
  dateNaissance?: string
  numeroSecuriteSociale?: string
  numeroCotisantIndividuel?: string
  structureNom: string
  codeApe?: string
  adresse?: string
  codePostal?: string
  ville?: string
  telephoneStructure?: string
  structureEmail?: string
  contactPrincipal?: any
  programme?: string
  notes?: string
}

export const creerApprenant: PayloadHandler = async (req) => {
  try {
    const data = req.body as unknown as ApprenantData

    console.log('🔍 Création apprenant - Données reçues:', data)

    // Validation des données requises
    if (!data.nom || !data.prenom || !data.email || !data.siret) {
      return Response.json(
        {
          success: false,
          error: 'Données manquantes: nom, prenom, email et siret sont requis',
        },
        { status: 400 }
      )
    }

    // 1️⃣ Vérifier si la structure juridique existe déjà (via SIRET)
    const existingStructures = await req.payload.find({
      collection: 'structures-juridiques',
      where: {
        siret: {
          equals: data.siret,
        },
      },
      limit: 1,
    })

    let structureId: string

    if (existingStructures.docs.length === 0) {
      console.log('📝 Création nouvelle structure juridique:', data.structureNom)

      // Créer la nouvelle structure
      const newStructure = await req.payload.create({
        collection: 'structures-juridiques',
        data: {
          nom: data.structureNom,
          siret: data.siret,
          codeApe: data.codeApe || '',
          adresse: data.adresse || '',
          codePostal: data.codePostal || '',
          ville: data.ville || '',
          telephone: data.telephoneStructure || '',
          email: data.structureEmail || '',
          contactPrincipal: data.contactPrincipal || undefined,
        },
      })

      structureId = newStructure.id as string
      console.log('✅ Structure créée avec ID:', structureId)
    } else {
      structureId = existingStructures.docs[0]!.id as string
      console.log('♻️ Structure existante trouvée, ID:', structureId)
    }

    // 2️⃣ Vérifier si l'apprenant existe déjà (via email)
    const existingApprenant = await req.payload.find({
      collection: 'apprenants',
      where: {
        email: {
          equals: data.email,
        },
      },
      limit: 1,
    })

    if (existingApprenant.docs.length > 0) {
      return Response.json(
        {
          success: false,
          error: 'Un apprenant avec cet email existe déjà',
          apprenantId: existingApprenant.docs[0]!.id,
        },
        { status: 409 }
      )
    }

    // 3️⃣ Créer l'apprenant complet
    console.log('📝 Création apprenant avec structure ID:', structureId)

    const apprenant = await req.payload.create({
      collection: 'apprenants',
      data: {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone || '',
        dateNaissance: data.dateNaissance || undefined,
        numeroSecuriteSociale: data.numeroSecuriteSociale || '',
        numeroCotisantIndividuel: data.numeroCotisantIndividuel || '',
        structureJuridique: structureId,
        programme: data.programme || '',
        statut: 'prospect',
        progression: 0,
        notes: data.notes || '',
      },
    })

    console.log('✅ Apprenant créé avec succès:', apprenant.id)

    return Response.json(
      {
        success: true,
        message: 'Apprenant et structure créés avec succès',
        data: {
          apprenant: {
            id: apprenant.id,
            nom: apprenant.nom,
            prenom: apprenant.prenom,
            email: apprenant.email,
          },
          structureId,
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du dossier apprenant:', error)
    return Response.json(
      {
        success: false,
        error: 'Erreur lors de la création du dossier apprenant',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
