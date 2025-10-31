import type { CollectionConfig } from 'payload'

export const StructuresJuridiques: CollectionConfig = {
  slug: 'structures-juridiques',
  labels: {
    singular: 'Structure Juridique',
    plural: 'Structures Juridiques',
  },
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'siret', 'ville', 'email'],
    group: 'Gestion B2B',
  },
  fields: [
    {
      name: 'nom',
      label: 'Nom de la structure',
      type: 'text',
      required: true,
      admin: {
        description: "Raison sociale de l'entreprise",
      },
    },
    {
      name: 'siret',
      label: 'SIRET',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Numéro SIRET à 14 chiffres',
      },
    },
    {
      name: 'codeApe',
      label: 'Code APE',
      type: 'text',
      admin: {
        description: "Code d'activité principale (ex: 6201Z)",
      },
    },
    {
      name: 'adresse',
      label: 'Adresse',
      type: 'text',
    },
    {
      name: 'codePostal',
      label: 'Code Postal',
      type: 'text',
    },
    {
      name: 'ville',
      label: 'Ville',
      type: 'text',
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
    },
    {
      name: 'contactPrincipal',
      label: 'Contact principal',
      type: 'group',
      fields: [
        {
          name: 'nom',
          label: 'Nom',
          type: 'text',
        },
        {
          name: 'prenom',
          label: 'Prénom',
          type: 'text',
        },
        {
          name: 'fonction',
          label: 'Fonction',
          type: 'text',
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
        },
        {
          name: 'telephone',
          label: 'Téléphone',
          type: 'text',
        },
      ],
    },
  ],
}
