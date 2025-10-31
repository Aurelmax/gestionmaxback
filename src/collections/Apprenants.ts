import type { CollectionConfig } from 'payload'

export const Apprenants: CollectionConfig = {
  slug: 'apprenants',
  labels: {
    singular: 'Apprenant',
    plural: 'Apprenants',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['nom', 'prenom', 'email', 'structureJuridique', 'statut'],
    group: 'Gestion Formation',
  },
  fields: [
    // Informations personnelles
    {
      type: 'row',
      fields: [
        {
          name: 'nom',
          label: 'Nom',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'prenom',
          label: 'Prénom',
          type: 'text',
          required: true,
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          unique: true,
          admin: {
            width: '50%',
          },
        },
        {
          name: 'telephone',
          label: 'Téléphone',
          type: 'text',
          admin: {
            width: '50%',
          },
        },
      ],
    },

    // Informations administratives
    {
      type: 'collapsible',
      label: 'Informations Administratives',
      fields: [
        {
          name: 'dateNaissance',
          label: 'Date de naissance',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
              displayFormat: 'dd/MM/yyyy',
            },
          },
        },
        {
          name: 'numeroSecuriteSociale',
          label: 'Numéro de Sécurité Sociale',
          type: 'text',
          admin: {
            description: '15 chiffres (ex: 1 85 03 75 120 123 45)',
          },
        },
        {
          name: 'numeroCotisantIndividuel',
          label: 'Numéro de cotisant individuel',
          type: 'text',
          admin: {
            description: 'Pour les travailleurs indépendants',
          },
        },
      ],
    },

    // Structure B2B
    {
      name: 'structureJuridique',
      label: 'Structure Juridique',
      type: 'relationship',
      relationTo: 'structures-juridiques',
      required: false, // Optionnel pour permettre la modification sans gérer la structure
      hasMany: false,
      admin: {
        description: "Entreprise ou structure rattachée à l'apprenant",
      },
    },

    // Programme et formation
    {
      type: 'row',
      fields: [
        {
          name: 'programme',
          label: 'Programme de formation',
          type: 'text',
          admin: {
            description: "Programme auquel l'apprenant est inscrit",
            width: '50%',
          },
        },
        {
          name: 'statut',
          label: 'Statut',
          type: 'select',
          required: true,
          defaultValue: 'prospect',
          options: [
            { label: 'Prospect', value: 'prospect' },
            { label: 'Inscrit', value: 'inscrit' },
            { label: 'En formation', value: 'en-formation' },
            { label: 'Terminé', value: 'termine' },
            { label: 'Abandonné', value: 'abandonne' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },

    // Progression
    {
      name: 'progression',
      label: 'Progression (%)',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 0,
      admin: {
        description: 'Pourcentage de complétion du parcours',
      },
    },

    // Notes additionnelles
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      admin: {
        description: 'Remarques ou informations complémentaires',
      },
    },
  ],
}
