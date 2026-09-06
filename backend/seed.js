import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import Workspace from "./models/workspace.js";
import Project from "./models/project.js";
import Task from "./models/task.js";

async function seed() {
  try {
    console.log("Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connecté avec succès à MongoDB.");

    // 1. Trouver ou créer un utilisateur principal de démo
    let user = await User.findOne();
    if (!user) {
      console.log("Création de l'utilisateur de démonstration...");
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash("Password123!", salt);
      user = await User.create({
        name: "Démo User",
        email: "demo@example.com",
        password: hashPassword,
        isEmailVerified: true,
      });
      console.log("Utilisateur créé : demo@example.com / Password123!");
    } else {
      console.log(`Utilisateur existant trouvé : ${user.email}`);
    }

    // 2. Vérifier si l'utilisateur a déjà des workspaces
    let workspace = await Workspace.findOne({ "members.user": user._id });
    if (!workspace) {
      console.log("Création du workspace de démonstration...");
      workspace = await Workspace.create({
        name: "Espace CoFlow Demo",
        description: "Espace de travail collaboratif pour gérer nos projets",
        color: "#3b82f6",
        owner: user._id,
        members: [
          {
            user: user._id,
            role: "owner",
            joinedAt: new Date(),
          },
        ],
        projects: [],
      });
      console.log(`Workspace créé : ${workspace.name} (${workspace._id})`);
    } else {
      console.log(`Workspace existant trouvé : ${workspace.name} (${workspace._id})`);
    }

    // 3. Créer des projets si le workspace est vide
    const existingProjects = await Project.countDocuments({ workspace: workspace._id });
    if (existingProjects === 0) {
      console.log("Création des projets de démonstration...");

      const now = new Date();
      const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Projet 1
      const project1 = await Project.create({
        title: "Refonte Application Web",
        description: "Modernisation de l'interface et intégration des dashboards analytiques.",
        status: "In Progress",
        startDate: now,
        dueDate: inSevenDays,
        tags: ["Frontend", "React", "Design"],
        workspace: workspace._id,
        createdBy: user._id,
        members: [{ user: user._id, role: "manager" }],
        tasks: [],
      });

      // Projet 2
      const project2 = await Project.create({
        title: "Application Mobile CoFlow",
        description: "Développement de l'application mobile multiplateforme.",
        status: "Planning",
        startDate: now,
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        tags: ["Mobile", "React Native"],
        workspace: workspace._id,
        createdBy: user._id,
        members: [{ user: user._id, role: "manager" }],
        tasks: [],
      });

      // 4. Créer des tâches pour les projets
      const task1 = await Task.create({
        title: "Intégration du nouveau Dashboard et KPIs",
        description: "Finaliser les composants visuels et les graphiques de productivité.",
        status: "Done",
        priority: "High",
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        project: project1._id,
        createdBy: user._id,
        assignees: [user._id],
        tags: ["Frontend", "Dashboard"],
      });

      const task2 = await Task.create({
        title: "Optimisation des requêtes API et cache",
        description: "Réduire les temps de réponse sur les agrégations de statistiques.",
        status: "In Progress",
        priority: "High",
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        project: project1._id,
        createdBy: user._id,
        assignees: [user._id],
        tags: ["Performance", "Backend"],
      });

      const task3 = await Task.create({
        title: "Revue des permissions et invitations membres",
        description: "Tester le flux d'invitation par token et par lien partagé.",
        status: "To Do",
        priority: "Medium",
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        project: project1._id,
        createdBy: user._id,
        assignees: [user._id],
        tags: ["Securité"],
      });

      const task4 = await Task.create({
        title: "Maquettes Figma Application Mobile",
        description: "Valider les wireframes des écrans principaux.",
        status: "Done",
        priority: "Medium",
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        project: project2._id,
        createdBy: user._id,
        assignees: [user._id],
        tags: ["Design", "Mobile"],
      });

      const task5 = await Task.create({
        title: "Setup de l'environnement React Native",
        description: "Initialisation du dépôt et configuration des dépendances mobiles.",
        status: "To Do",
        priority: "High",
        dueDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        project: project2._id,
        createdBy: user._id,
        assignees: [user._id],
        tags: ["Mobile", "Architecture"],
      });

      // Associer les tâches aux projets
      project1.tasks.push(task1._id, task2._id, task3._id);
      await project1.save();

      project2.tasks.push(task4._id, task5._id);
      await project2.save();

      // Associer les projets au workspace
      workspace.projects.push(project1._id, project2._id);
      await workspace.save();

      console.log("Projets et tâches créés avec succès !");
    } else {
      console.log(`Le workspace possède déjà ${existingProjects} projet(s).`);
    }

    console.log("\n==========================================");
    console.log("  Données initialisées avec succès !");
    console.log("  Email de connexion : " + user.email);
    console.log("  Workspace          : " + workspace.name);
    console.log("==========================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors du seed :", err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
