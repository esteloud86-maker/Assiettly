import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Assiettly",
};

export default function CguPage() {
  return (
    <LegalLayout titre="Conditions générales d'utilisation" misAJourLe="13 septembre 2026">
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions générales d&rsquo;utilisation (&laquo;&nbsp;CGU&nbsp;&raquo;) régissent
          l&rsquo;accès et l&rsquo;utilisation de l&rsquo;application Assiettly, une application web de suivi
          nutritionnel (&laquo;&nbsp;le Service&nbsp;&raquo;), éditée par [À compléter : raison sociale / forme
          juridique] (voir les <a href="/mentions-legales">mentions légales</a>). En créant un compte ou en
          utilisant le Service, tu acceptes sans réserve les présentes CGU.
        </p>
      </section>

      <section>
        <h2>2. Description du service</h2>
        <p>
          Assiettly est une application web mobile-first, installable comme application progressive (PWA), qui
          permet de suivre son alimentation au quotidien. Le Service propose notamment&nbsp;:
        </p>
        <ul>
          <li>
            un parcours d&rsquo;onboarding qui recueille des informations personnelles (sexe, date de naissance,
            taille, poids, niveau d&rsquo;activité, objectif de poids, poids cible, préférences alimentaires,
            motivation) afin de calculer un objectif quotidien indicatif de calories et de macronutriments (formule
            de Mifflin-St Jeor)&nbsp;;
          </li>
          <li>
            un journal alimentaire dans lequel les repas peuvent être ajoutés manuellement, par scan de
            code-barres (via la base de données publique Open Food Facts), ou par photo&nbsp;;
          </li>
          <li>
            une analyse automatique des repas photographiés par intelligence artificielle (API Claude
            d&rsquo;Anthropic), qui estime les aliments, les quantités et les valeurs nutritionnelles associées —
            cette estimation reste indicative et peut être corrigée manuellement avant validation&nbsp;;
          </li>
          <li>
            une mécanique de gamification (&laquo;&nbsp;flamme&nbsp;&raquo;/streak) qui valorise la régularité du
            suivi, avec jusqu&rsquo;à deux &laquo;&nbsp;freezes&nbsp;&raquo; par mois pour préserver la flamme en
            cas de jour manqué&nbsp;;
          </li>
          <li>
            des rappels par e-mail et, si l&rsquo;utilisateur les active, par notification push, destinés à
            encourager la régularité du suivi.
          </li>
        </ul>
        <p>
          Certaines fonctionnalités affichées dans l&rsquo;application (badges et défis entre amis, coach
          IA) sont en cours de déploiement progressif et peuvent être partiellement fonctionnelles, présentées à
          titre de démonstration, ou évoluer sans préavis ; Assiettly s&rsquo;engage à ne pas présenter comme
          pleinement opérationnelle une fonctionnalité qui ne l&rsquo;est pas encore.
        </p>
      </section>

      <section>
        <h2>3. Création de compte</h2>
        <p>
          L&rsquo;accès au Service nécessite la création d&rsquo;un compte avec une adresse e-mail et un mot de
          passe. La connexion via Google ou Apple peut être proposée mais n&rsquo;est pas activée à ce jour.
          L&rsquo;utilisateur s&rsquo;engage à fournir des informations exactes et à conserver la confidentialité
          de ses identifiants. Assiettly est réservé aux personnes majeures ou légalement autorisées à consentir
          au traitement de données de santé dans leur juridiction.
        </p>
      </section>

      <section>
        <h2>4. Offre gratuite, abonnement Premium et essai gratuit</h2>
        <p>Assiettly propose deux formules&nbsp;:</p>
        <ul>
          <li>
            <strong>Offre gratuite</strong>&nbsp;: journal alimentaire et mécanique de flamme en illimité, jusqu&rsquo;à
            3 scans de repas par photo par semaine.
          </li>
          <li>
            <strong>Offre Premium</strong>&nbsp;: 6,99&nbsp;€/mois ou 49,99&nbsp;€/an, incluant les scans de repas
            par photo illimités, l&rsquo;historique complet et l&rsquo;export des données, ainsi que les
            fonctionnalités en cours de déploiement mentionnées à l&rsquo;article 2.
          </li>
        </ul>
        <p>
          L&rsquo;abonnement Premium est proposé avec un essai gratuit de 7 jours à l&rsquo;inscription. Le
          paiement est géré par Stripe&nbsp;; à défaut de résiliation avant la fin de la période d&rsquo;essai,
          l&rsquo;abonnement démarre automatiquement et le montant correspondant à la formule choisie est prélevé.
          L&rsquo;utilisateur peut résilier son abonnement à tout moment, sans engagement, directement depuis son
          profil via le portail de gestion d&rsquo;abonnement Stripe&nbsp;; la résiliation prend effet à la fin de
          la période déjà payée, sans remboursement au prorata de la période en cours sauf disposition légale
          contraire.
        </p>
      </section>

      <section>
        <h2>5. Obligations de l&rsquo;utilisateur</h2>
        <p>L&rsquo;utilisateur s&rsquo;engage à&nbsp;:</p>
        <ul>
          <li>utiliser le Service conformément à sa destination et aux présentes CGU&nbsp;;</li>
          <li>ne pas tenter de porter atteinte à la sécurité ou au bon fonctionnement du Service&nbsp;;</li>
          <li>
            ne pas transmettre, via les fonctionnalités photo ou communautaires, de contenu illicite, portant
            atteinte aux droits de tiers, ou sans rapport avec l&rsquo;objet du Service&nbsp;;
          </li>
          <li>fournir des informations personnelles exactes, notamment lors de l&rsquo;onboarding.</li>
        </ul>
      </section>

      <section>
        <h2>6. Propriété intellectuelle</h2>
        <p>
          Le Service, sa structure, son contenu et ses éléments graphiques sont protégés par le droit de la
          propriété intellectuelle, comme précisé dans les <a href="/mentions-legales">mentions légales</a>.
          L&rsquo;utilisateur conserve la propriété des données qu&rsquo;il renseigne (poids, repas, photos) et
          concède à Assiettly le droit strictement nécessaire de les traiter pour fournir le Service.
        </p>
      </section>

      <section>
        <h2>7. Avertissement santé — Assiettly n&rsquo;est pas un dispositif médical</h2>
        <p>
          Assiettly est un outil de suivi nutritionnel à visée informative et motivationnelle. Les objectifs
          caloriques et de macronutriments calculés par l&rsquo;application reposent sur une formule générique
          (Mifflin-St Jeor) appliquée aux informations déclarées par l&rsquo;utilisateur&nbsp;: ce sont des
          estimations, pas des prescriptions personnalisées.
        </p>
        <p>
          <strong>
            Assiettly ne fournit pas de conseil médical, diététique ou thérapeutique et ne remplace en aucun cas
            l&rsquo;avis d&rsquo;un médecin, d&rsquo;un·e diététicien·ne ou de tout professionnel de santé.
          </strong>{" "}
          Si tu suis un traitement médical, es enceinte ou allaitante, mineur·e, ou si tu as des antécédents ou un
          risque de troubles du comportement alimentaire, consulte un professionnel de santé avant d&rsquo;utiliser
          des objectifs caloriques comme ceux calculés par l&rsquo;application, et ne les utilise pas comme
          justification pour une restriction alimentaire excessive. En cas de doute sur ta relation à
          l&rsquo;alimentation, nous t&rsquo;invitons à en parler à un professionnel de santé plutôt qu&rsquo;à te
          fier uniquement à l&rsquo;application.
        </p>
        <p>
          L&rsquo;analyse automatique des photos de repas par intelligence artificielle est une estimation qui
          peut se tromper (aliment mal identifié, quantité approximative) et doit être vérifiée avant d&rsquo;être
          utilisée pour une décision importante.
        </p>
      </section>

      <section>
        <h2>8. Limitation de responsabilité</h2>
        <p>
          Le Service est fourni &laquo;&nbsp;en l&rsquo;état&nbsp;&raquo;. Assiettly met en œuvre des moyens
          raisonnables pour assurer la disponibilité, la sécurité et l&rsquo;exactitude du Service, sans pouvoir
          garantir une disponibilité continue ni l&rsquo;absence totale d&rsquo;erreur, notamment concernant les
          estimations nutritionnelles issues de bases de données tierces (Open Food Facts) ou de l&rsquo;analyse
          par intelligence artificielle. Assiettly ne saurait être tenu responsable des conséquences d&rsquo;une
          utilisation du Service non conforme aux présentes CGU ou à l&rsquo;avertissement santé de l&rsquo;article
          7.
        </p>
      </section>

      <section>
        <h2>9. Résiliation</h2>
        <p>
          L&rsquo;utilisateur peut cesser d&rsquo;utiliser le Service et demander la suppression de son compte à
          tout moment, depuis son profil ou en écrivant à <a href="mailto:contact@assiettly.fr">contact@assiettly.fr</a> (voir la{" "}
          <a href="/confidentialite">politique de confidentialité</a> pour les modalités). Assiettly se réserve le
          droit de suspendre ou de résilier l&rsquo;accès d&rsquo;un utilisateur en cas de manquement grave aux
          présentes CGU.
        </p>
      </section>

      <section>
        <h2>10. Droit applicable et juridiction compétente</h2>
        <p>
          Les présentes CGU sont soumises au droit français. En cas de litige et à défaut de résolution amiable,
          les tribunaux français compétents seront seuls saisis, sous réserve des dispositions impératives
          applicables aux consommateurs prévoyant une autre règle de compétence.
        </p>
      </section>

      <section>
        <h2>11. Modification des CGU</h2>
        <p>
          Assiettly peut modifier les présentes CGU, notamment pour refléter une évolution du Service ou de la
          réglementation applicable. La date de dernière mise à jour figure en haut de cette page. En cas de
          modification substantielle, les utilisateurs en seront informés par e-mail ou par une notification dans
          l&rsquo;application. La poursuite de l&rsquo;utilisation du Service après entrée en vigueur des nouvelles
          CGU vaut acceptation de celles-ci.
        </p>
      </section>
    </LegalLayout>
  );
}
