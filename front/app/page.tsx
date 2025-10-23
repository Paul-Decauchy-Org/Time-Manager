import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Timer,
  UserPlus,
  Calendar
} from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      {/* Animated Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold">Time Manager</span>
              </div>
              <nav className="hidden md:flex items-center gap-8">
              </nav>
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold">
                    Connexion
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="font-semibold shadow-lg hover:shadow-xl transition-all">
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4"/>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                Gestion du temps simplifiée
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Gérez votre temps
                <br />
                <span className="text-primary">Boostez votre productivité</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl">
                La plateforme tout-en-un pour suivre le temps de travail et gérer vos équipes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="text-base font-semibold shadow-xl hover:shadow-2xl transition-all h-12 px-8">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="text-base font-semibold h-12 px-8">
                    Découvrir
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <Card className="border-0 shadow-2xl backdrop-blur-sm bg-background/95">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/20 p-2">
                          <Timer className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Temps journalier de travail</p>
                          <p className="text-2xl font-bold text-primary">7h</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Différentes équipes de travail</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Suivi du temps de travail des utilisateurs</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {["Pointage d'heure d'arrivée", "Pointage de départ", "Gestion des équipes", "Données statistiques"].map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-medium">{task}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Des fonctionnalités puissantes pour gérer votre temps et vos équipes efficacement
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Timer,
                  title: "Suivi du temps",
                  description: "Enregistrez et suivez votre temps de travail avec précision sur tous vos projets"
                },
                {
                  icon: Users,
                  title: "Gestion d'équipe",
                  description: "Gérez vos équipes, assignez des tâches et suivez la progression en temps réel"
                },
                {
                  icon: BarChart3,
                  title: "Rapports détaillés",
                  description: "Générez des rapports complets pour analyser votre productivité"
                },
              ].map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-6 space-y-4">
                    <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background/80 backdrop-blur-sm py-12 ">
          <div className="container mx-auto px-6">
            <div className="border-t pt-8 flex flex-col md:flex-row items-center gap-4 items-center justify-center flex">
              <p className="text-sm text-muted-foreground">
                &copy; 2025 Time Manager. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
