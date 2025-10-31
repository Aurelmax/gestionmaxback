import * as path from 'path'
import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import { StructuresJuridiques } from './collections/StructuresJuridiques'
import { Apprenants } from './collections/Apprenants'
import { creerApprenant } from './endpoints/creerApprenant'

export default buildConfig({
  sharp,
  secret: process.env['PAYLOAD_SECRET'] || 'your-secret-key-change-this-in-production',
  email: resendAdapter({
    defaultFromAddress: process.env['RESEND_DEFAULT_EMAIL'] || 'noreply@gestionmax.fr',
    defaultFromName: 'GestionMax Formation',
    apiKey: process.env['RESEND_API_KEY'] || '',
  }),
  admin: {
    // Désactiver l'interface admin native Payload
    // Tout se fait maintenant via /dashboard (interface React custom)
    disable: true,
    user: 'users',
    meta: {
      titleSuffix: '- GestionMax CMS',
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/favicon.ico',
        },
      ],
    },
  },
  routes: {
    // Admin UI accessible via /admin (correspond à src/app/(payload)/admin)
    admin: '/admin',
    api: '/api',
  },
  serverURL: process.env['NEXT_PUBLIC_SERVER_URL'] || 'http://localhost:3010',
  // 🔧 Configuration CSRF et CORS pour la gestion des cookies de session
  csrf: [
    'http://localhost:3010',
    'http://localhost:3000',
    'https://gestionmax.fr',
    'https://www.gestionmax.fr',
    'https://formation-app-gestionmax.vercel.app',
    'https://formation-app-gestionmax-production.up.railway.app',
    process.env['NEXT_PUBLIC_SERVER_URL'] || '',
  ].filter(Boolean),
  cors: [
    'http://localhost:3010',
    'http://localhost:3000',
    'https://gestionmax.fr',
    'https://www.gestionmax.fr',
    'https://formation-app-gestionmax.vercel.app',
    'https://formation-app-gestionmax-production.up.railway.app',
    process.env['NEXT_PUBLIC_SERVER_URL'] || '',
  ].filter(Boolean),
  // 🔧 Préfixe pour éviter les collisions de cookies entre Next.js et Payload
  cookiePrefix: 'payload',
  editor: lexicalEditor({}),
  collections: [
    {
      slug: 'users',
      auth: {
        forgotPassword: {
          generateEmailHTML: args => {
            const token = args?.token || ''
            const user = args?.user
            const resetURL = `${process.env['NEXT_PUBLIC_SERVER_URL'] || 'http://localhost:3010'}/admin/reset-password?token=${token}`
            return `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <title>Réinitialisation de mot de passe</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
                    <p>Bonjour ${user?.name || user?.email || 'utilisateur'},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte GestionMax.</p>
                    <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetURL}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Réinitialiser mon mot de passe
                      </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">
                      Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                      <a href="${resetURL}" style="color: #2563eb;">${resetURL}</a>
                    </p>
                    <p style="color: #666; font-size: 14px;">
                      Ce lien expirera dans 1 heure pour des raisons de sécurité.
                    </p>
                    <p style="color: #666; font-size: 14px;">
                      Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">
                      © 2024 GestionMax Formation - Tous droits réservés
                    </p>
                  </div>
                </body>
              </html>
            `
          },
          generateEmailSubject: () => 'Réinitialisation de votre mot de passe GestionMax',
        },
        verify: false,
      },
      access: {
        // Tout le monde peut lire son propre profil
        read: ({ req: { user } }) => {
          // Admins et superAdmins peuvent lire tous les utilisateurs
          if (user && (user['role'] === 'admin' || user['role'] === 'superAdmin')) {
            return true
          }
          // Les autres utilisateurs peuvent seulement lire leur propre profil
          if (user) {
            return {
              id: {
                equals: user.id,
              },
            }
          }
          return false
        },
        // Seuls les admins et superAdmins peuvent créer des utilisateurs
        create: ({ req: { user } }) => {
          if (!user) return false
          return user['role'] === 'admin' || user['role'] === 'superAdmin'
        },
        // Les utilisateurs peuvent modifier leur propre profil, les admins peuvent tout modifier
        update: ({ req: { user } }) => {
          if (user && (user['role'] === 'admin' || user['role'] === 'superAdmin')) {
            return true
          }
          if (user) {
            return {
              id: {
                equals: user.id,
              },
            }
          }
          return false
        },
        // Seuls les superAdmins peuvent supprimer des utilisateurs
        delete: ({ req: { user } }) => {
          if (!user) return false
          return user['role'] === 'superAdmin'
        },
        // Tout le monde peut accéder à l'admin pour se connecter
        admin: () => true,
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'firstName',
          type: 'text',
        },
        {
          name: 'lastName',
          type: 'text',
        },
        {
          name: 'role',
          type: 'select',
          options: [
            {
              label: 'Super Admin',
              value: 'superAdmin',
            },
            {
              label: 'Admin',
              value: 'admin',
            },
            {
              label: 'Formateur',
              value: 'formateur',
            },
            {
              label: 'Gestionnaire',
              value: 'gestionnaire',
            },
            {
              label: 'Apprenant',
              value: 'apprenant',
            },
          ],
          defaultValue: 'apprenant',
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          options: [
            {
              label: 'Actif',
              value: 'active',
            },
            {
              label: 'Inactif',
              value: 'inactive',
            },
            {
              label: 'Suspendu',
              value: 'suspended',
            },
            {
              label: 'En attente',
              value: 'pending',
            },
          ],
          defaultValue: 'active',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
        {
          name: 'dateOfBirth',
          type: 'date',
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'permissions',
          type: 'array',
          fields: [
            {
              name: 'permission',
              type: 'select',
              options: [
                { label: 'Lecture utilisateurs', value: 'users:read' },
                { label: 'Création utilisateurs', value: 'users:create' },
                { label: 'Modification utilisateurs', value: 'users:update' },
                { label: 'Suppression utilisateurs', value: 'users:delete' },
                { label: 'Lecture formations', value: 'formations:read' },
                { label: 'Création formations', value: 'formations:create' },
                { label: 'Modification formations', value: 'formations:update' },
                { label: 'Suppression formations', value: 'formations:delete' },
                { label: 'Lecture apprenants', value: 'apprenants:read' },
                { label: 'Création apprenants', value: 'apprenants:create' },
                { label: 'Modification apprenants', value: 'apprenants:update' },
                { label: 'Suppression apprenants', value: 'apprenants:delete' },
                { label: 'Lecture rendez-vous', value: 'rendez_vous:read' },
                { label: 'Création rendez-vous', value: 'rendez_vous:create' },
                { label: 'Modification rendez-vous', value: 'rendez_vous:update' },
                { label: 'Suppression rendez-vous', value: 'rendez_vous:delete' },
                { label: 'Lecture documents', value: 'documents:read' },
                { label: 'Création documents', value: 'documents:create' },
                { label: 'Modification documents', value: 'documents:update' },
                { label: 'Suppression documents', value: 'documents:delete' },
                { label: 'Accès admin', value: 'admin:access' },
                { label: 'Paramètres système', value: 'system:settings' },
                { label: 'Accès rapports', value: 'reports:access' },
              ],
            },
          ],
        },
        {
          name: 'lastLoginAt',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'metadata',
          type: 'json',
        },
      ],
    },
    {
      slug: 'formations',
      fields: [
        {
          name: 'titre',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          required: true,
        },
        {
          name: 'duree',
          type: 'number',
          required: true,
        },
        {
          name: 'niveau',
          type: 'select',
          options: [
            { label: 'Débutant', value: 'Débutant' },
            { label: 'Intermédiaire', value: 'Intermédiaire' },
            { label: 'Avancé', value: 'Avancé' },
          ],
          required: true,
        },
        {
          name: 'modalites',
          type: 'select',
          options: [
            { label: 'Présentiel', value: 'Présentiel' },
            { label: 'Distanciel', value: 'Distanciel' },
            { label: 'Hybride', value: 'Hybride' },
          ],
          required: true,
        },
        {
          name: 'prix',
          type: 'number',
          required: true,
        },
        {
          name: 'competences',
          type: 'array',
          fields: [
            {
              name: 'competence',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'codeFormation',
          type: 'text',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      slug: 'formations_personnalisees',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Nom du programme de formation',
        },
        {
          name: 'codeFormation',
          type: 'text',
          required: true,
          unique: true,
          label: 'Code formation',
          admin: {
            description: 'Code unique de la formation (ex: A123456-DUPONT)',
          },
        },
        {
          name: 'objectifs',
          type: 'richText',
          label: 'Objectifs pédagogiques',
        },
        {
          name: 'programmeDetail',
          type: 'array',
          label: 'Détail des modules et séances',
          fields: [
            {
              name: 'jour',
              type: 'text',
              label: 'Jour (ex: Jour 1, Jour 2)',
            },
            {
              name: 'duree',
              type: 'text',
              label: 'Durée (ex: 7 heures)',
            },
            {
              name: 'modules',
              type: 'array',
              label: 'Modules du jour',
              fields: [
                {
                  name: 'titre',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                },
                {
                  name: 'duree',
                  type: 'text',
                },
                {
                  name: 'contenu',
                  type: 'richText',
                },
              ],
            },
          ],
        },
        {
          name: 'modalitesAcces',
          type: 'group',
          label: "Modalités d'accès",
          fields: [
            {
              name: 'prerequis',
              type: 'textarea',
              label: 'Prérequis',
            },
            {
              name: 'publicConcerne',
              type: 'textarea',
              label: 'Public concerné',
            },
            {
              name: 'duree',
              type: 'text',
              label: 'Durée totale',
            },
            {
              name: 'horaires',
              type: 'text',
              label: 'Horaires',
            },
            {
              name: 'delaisMiseEnPlace',
              type: 'text',
              label: 'Délais de mise en place',
            },
            {
              name: 'tarif',
              type: 'number',
              label: 'Tarif en euros',
            },
            {
              name: 'modalitesReglement',
              type: 'textarea',
              label: 'Modalités de règlement',
            },
          ],
        },
        {
          name: 'contactFormateur',
          type: 'group',
          label: 'Contact formateur',
          fields: [
            {
              name: 'nom',
              type: 'text',
              required: true,
            },
            {
              name: 'email',
              type: 'email',
              required: true,
            },
            {
              name: 'telephone',
              type: 'text',
            },
            {
              name: 'role',
              type: 'text',
              label: 'Rôle/Fonction',
            },
            {
              name: 'biographie',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'modalitesPedagogiques',
          type: 'richText',
          label: 'Modalités techniques et pédagogiques',
        },
        {
          name: 'ressourcesDispo',
          type: 'array',
          label: 'Ressources mises à disposition',
          fields: [
            {
              name: 'ressource',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
            },
          ],
        },
        {
          name: 'modalitesEvaluation',
          type: 'group',
          label: "Modalités d'évaluation",
          fields: [
            {
              name: 'typesEvaluation',
              type: 'array',
              label: "Types d'évaluation",
              fields: [
                {
                  name: 'type',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                },
              ],
            },
            {
              name: 'plateformeEvaluation',
              type: 'text',
              label: "Plateforme d'évaluation",
            },
            {
              name: 'grilleAnalyse',
              type: 'textarea',
              label: "Grille d'analyse des compétences",
            },
          ],
        },
        {
          name: 'sanctionFormation',
          type: 'text',
          label: 'Sanction de la formation',
        },
        {
          name: 'niveauCertification',
          type: 'text',
          label: 'Niveau/Certification obtenue',
        },
        {
          name: 'accessibiliteHandicap',
          type: 'group',
          label: 'Accessibilité handicap',
          fields: [
            {
              name: 'referentHandicap',
              type: 'text',
              label: 'Référent handicap',
            },
            {
              name: 'contactReferent',
              type: 'text',
              label: 'Contact référent',
            },
            {
              name: 'adaptationsProposees',
              type: 'textarea',
              label: 'Adaptations proposées',
            },
          ],
        },
        {
          name: 'cessationAbandon',
          type: 'group',
          label: 'Cessation anticipée/Abandon',
          fields: [
            {
              name: 'conditionsRenonciation',
              type: 'textarea',
              label: 'Conditions de renonciation',
            },
            {
              name: 'facturationAbandon',
              type: 'textarea',
              label: "Modalités de facturation en cas d'abandon",
            },
          ],
        },
        {
          name: 'statut',
          type: 'select',
          options: [
            { label: 'En cours', value: 'EN_COURS' },
            { label: 'Finalisée', value: 'FINALISEE' },
            { label: 'Livrée', value: 'LIVREE' },
            { label: 'Archivée', value: 'ARCHIVE' },
          ],
          defaultValue: 'EN_COURS',
        },
      ],
    },
    StructuresJuridiques,
    Apprenants,
    {
      slug: 'articles',
      access: {
        read: () => true, // Lecture publique pour les articles
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
      fields: [
        {
          name: 'titre',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'contenu',
          type: 'richText',
          required: true,
        },
        {
          name: 'resume',
          type: 'textarea',
          required: true,
        },
        {
          name: 'auteur',
          type: 'text',
          required: true,
        },
        {
          name: 'datePublication',
          type: 'date',
          required: true,
        },
        {
          name: 'statut',
          type: 'select',
          options: [
            { label: 'Brouillon', value: 'brouillon' },
            { label: 'Publié', value: 'publie' },
            { label: 'Archivé', value: 'archive' },
          ],
          defaultValue: 'brouillon',
          required: true,
        },
        {
          name: 'categories',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
        },
        {
          name: 'tags',
          type: 'relationship',
          relationTo: 'tags',
          hasMany: true,
        },
        {
          name: 'imagePrincipale',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          required: true,
        },
        {
          name: 'metaKeywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
            },
          ],
        },
        {
          name: 'vue',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'tempsLecture',
          type: 'number',
          defaultValue: 5,
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      slug: 'categories',
      access: {
        read: () => true, // Lecture publique
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
      fields: [
        {
          name: 'nom',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'description',
          type: 'textarea',
        },
        {
          name: 'couleur',
          type: 'text',
          defaultValue: '#3B82F6',
        },
        {
          name: 'icone',
          type: 'text',
          defaultValue: '📝',
        },
      ],
    },
    {
      slug: 'tags',
      access: {
        read: () => true, // Lecture publique
        create: ({ req: { user } }) => !!user,
        update: ({ req: { user } }) => !!user,
        delete: ({ req: { user } }) => !!user,
      },
      fields: [
        {
          name: 'nom',
          type: 'text',
          required: true,
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'couleur',
          type: 'text',
          defaultValue: '#6B7280',
        },
      ],
    },
    {
      slug: 'programmes',
      fields: [
        {
          name: 'codeFormation',
          type: 'text',
          required: true,
          unique: true,
        },
        {
          name: 'titre',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
        {
          name: 'duree',
          type: 'number',
          required: true,
        },
        {
          name: 'niveau',
          type: 'select',
          options: [
            { label: 'Débutant', value: 'DEBUTANT' },
            { label: 'Intermédiaire', value: 'INTERMEDIAIRE' },
            { label: 'Avancé', value: 'AVANCE' },
          ],
          required: true,
        },
        {
          name: 'modalites',
          type: 'select',
          options: [
            { label: 'Présentiel', value: 'PRESENTIEL' },
            { label: 'Distanciel', value: 'DISTANCIEL' },
            { label: 'Hybride', value: 'HYBRIDE' },
          ],
          required: true,
        },
        {
          name: 'prix',
          type: 'number',
          required: true,
        },
        {
          name: 'competences',
          type: 'array',
          fields: [
            {
              name: 'competence',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'objectifs',
          type: 'richText',
        },
        {
          name: 'prerequis',
          type: 'richText',
        },
        {
          name: 'programme',
          type: 'richText',
        },
        {
          name: 'modalitesPedagogiques',
          type: 'richText',
        },
        {
          name: 'evaluation',
          type: 'richText',
        },
        {
          name: 'certification',
          type: 'text',
        },
        {
          name: 'eligibleCPF',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'codeCPF',
          type: 'text',
        },
        {
          name: 'statut',
          type: 'select',
          options: [
            { label: 'Actif', value: 'actif' },
            { label: 'Inactif', value: 'inactif' },
            { label: 'En développement', value: 'en_developpement' },
          ],
          defaultValue: 'actif',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
        },
        {
          name: 'students',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      slug: 'rendez-vous',
      fields: [
        {
          name: 'programme',
          type: 'relationship',
          relationTo: 'programmes',
          required: true,
        },
        {
          name: 'client',
          type: 'group',
          fields: [
            {
              name: 'nom',
              type: 'text',
              required: true,
            },
            {
              name: 'prenom',
              type: 'text',
              required: true,
            },
            {
              name: 'email',
              type: 'email',
              required: true,
            },
            {
              name: 'telephone',
              type: 'text',
              required: true,
            },
            {
              name: 'entreprise',
              type: 'text',
            },
          ],
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Positionnement', value: 'positionnement' },
            { label: 'Information', value: 'information' },
            { label: 'Inscription', value: 'inscription' },
            { label: 'Suivi', value: 'suivi' },
          ],
          defaultValue: 'positionnement',
          required: true,
        },
        {
          name: 'statut',
          type: 'select',
          options: [
            { label: 'En attente', value: 'enAttente' },
            { label: 'Confirmé', value: 'confirme' },
            { label: 'Terminé', value: 'termine' },
            { label: 'Annulé', value: 'annule' },
            { label: 'Reporté', value: 'reporte' },
          ],
          defaultValue: 'enAttente',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
        },
        {
          name: 'heure',
          type: 'text',
          required: true,
        },
        {
          name: 'duree',
          type: 'number',
          defaultValue: 30,
          required: true,
        },
        {
          name: 'lieu',
          type: 'select',
          options: [
            { label: 'Visio', value: 'visio' },
            { label: 'Présentiel', value: 'presentiel' },
            { label: 'Téléphone', value: 'telephone' },
          ],
          defaultValue: 'visio',
          required: true,
        },
        {
          name: 'adresse',
          type: 'textarea',
        },
        {
          name: 'lienVisio',
          type: 'text',
        },
        {
          name: 'notes',
          type: 'textarea',
        },
        {
          name: 'rappelEnvoye',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'createdBy',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'contacts',
      fields: [
        {
          name: 'nom',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
        },
        {
          name: 'telephone',
          type: 'text',
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Question générale', value: 'question' },
            { label: 'Réclamation', value: 'reclamation' },
            { label: 'Demande de formation', value: 'formation' },
            { label: 'Demande de devis', value: 'devis' },
          ],
          required: true,
        },
        {
          name: 'sujet',
          type: 'text',
          required: true,
        },
        {
          name: 'message',
          type: 'textarea',
          required: true,
        },
        {
          name: 'statut',
          type: 'select',
          options: [
            { label: 'Nouveau', value: 'nouveau' },
            { label: 'En cours', value: 'enCours' },
            { label: 'Traité', value: 'traite' },
            { label: 'Fermé', value: 'ferme' },
          ],
          defaultValue: 'nouveau',
          required: true,
        },
        {
          name: 'priorite',
          type: 'select',
          options: [
            { label: 'Basse', value: 'basse' },
            { label: 'Normale', value: 'normale' },
            { label: 'Haute', value: 'haute' },
            { label: 'Urgente', value: 'urgente' },
          ],
          defaultValue: 'normale',
          required: true,
        },
        {
          name: 'reponse',
          type: 'textarea',
        },
        {
          name: 'dateReponse',
          type: 'date',
        },
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: 'media',
        imageSizes: [
          {
            name: 'thumbnail',
            width: 400,
            height: 300,
            position: 'centre',
          },
          {
            name: 'card',
            width: 768,
            height: 1024,
            position: 'centre',
          },
        ],
        adminThumbnail: 'thumbnail',
        mimeTypes: ['image/*'],
      },
      fields: [
        {
          name: 'alt',
          type: 'text',
        },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  endpoints: [
    {
      path: '/creer-apprenant',
      method: 'post',
      handler: creerApprenant,
    },
  ],
  plugins: [],
  db: mongooseAdapter({
    url: (() => {
      const uri = process.env['MONGODB_URI'] || ''
      console.log('🔍 [Payload Config] MongoDB URI configurée:', uri ? `✅ ${uri.substring(0, 50)}...` : '❌ Vide')
      return uri
    })(),
    connectOptions: {
      // Options optimisées pour éviter les problèmes de connexion
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Forcer IPv4 au lieu d'IPv6
      // Désactiver la création automatique d'index en production
      autoIndex: process.env.NODE_ENV !== 'production',
      autoCreate: process.env.NODE_ENV !== 'production',
    },
  }),
})
