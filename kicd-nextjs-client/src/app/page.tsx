"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { GlobalNavBar } from "@/components/GlobalNavBar";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StaffSidebar } from "@/components/StaffSidebar";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";
import { useToast } from "@/components/ui/ToastContext";

function FadeInSection({ children, delay = 0 }: { children: ReactNode, delay?: number }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(currentRef);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border-light p-md flex flex-col">
      <div className="flex justify-between items-start mb-md">
        <div className="w-10 h-10 rounded bg-primary-fixed flex items-center justify-center text-primary skeleton"></div>
        <div className="w-20 h-6 bg-success/10 rounded-full skeleton"></div>
      </div>
      <div className="w-3/4 h-6 bg-surface-variant mb-xs skeleton"></div>
      <div className="w-full h-4 bg-surface-variant mb-lg skeleton"></div>
      <div className="flex justify-between items-center pt-md border-t border-border-light">
        <div className="w-24 h-4 bg-surface-variant skeleton"></div>
        <div className="w-24 h-10 bg-surface-variant rounded-lg skeleton"></div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const heroImages = ["/hero-img.png", "/hero-img-2.png", "/hero-img-3.png"];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    async function loadOpps() {
      try {
        const data = await api.get("/api/opportunities?status=PUBLISHED", { auth: false });
        setOpportunities(data || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadOpps();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApply = (oppId: number, deptId: number) => {
    if (user && user.role !== "STUDENT") {
      toast.error("Staff cannot apply for opportunities.");
      return;
    }

    if (user && user.role === "STUDENT") {
      sessionStorage.setItem("kicd_pending_opportunity", oppId.toString());
      sessionStorage.setItem("kicd_pending_department", deptId.toString());
      router.push(`/apply/${oppId}`);
    } else {
      sessionStorage.setItem("kicd_pending_opportunity", oppId.toString());
      sessionStorage.setItem("kicd_pending_department", deptId.toString());
      router.push("/register");
    }
  };
  return (
    <div className="min-h-screen bg-surface text-on-surface antialiased font-body-md flex flex-col">
      <GlobalNavBar />
      <StudentSidebar />
      <StaffSidebar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0 bg-black">
            {heroImages.map((src, idx) => (
              <img 
                key={src}
                alt={`KICD Reception Area ${idx + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${idx === currentHeroIndex ? 'opacity-100' : 'opacity-0'}`} 
                src={src} 
              />
            ))}
            <div className="absolute inset-0 hero-gradient"></div>
          </div>
          <div className="relative z-10 text-center px-gutter flex flex-col items-center gap-lg" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
            <span className="px-md py-xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider">Industrial Attachment Portal</span>
            <h1 className="font-display-lg text-display-lg text-on-primary mb-sm" style={{ width: "100%" }}>Nurturing Every Learner's Potential</h1>
            <p className="font-body-lg text-body-lg text-primary-fixed mb-xl" style={{ width: "100%", maxWidth: "700px" }}>
              Join the Kenya Institute of Curriculum Development for hands-on experience in shaping the future of education. Apply now for our comprehensive attachment program.
            </p>
            <div className="flex flex-col sm:flex-row gap-md" style={{ width: "100%", justifyContent: "center" }}>
              {user ? (
                <>
                  <button onClick={() => document.getElementById('opportunities')?.scrollIntoView({behavior: 'smooth'})} className="px-xl py-md rounded-lg font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 flex items-center justify-center gap-xs">
                    <span>Proceed with Applications</span>
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                  <Link href="/dashboard" className="px-xl py-md rounded-lg font-label-md text-label-md border-2 border-on-primary text-on-primary hover:bg-on-primary hover:text-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 text-center">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register" className="px-xl py-md rounded-lg font-label-md text-label-md bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 flex items-center justify-center gap-xs">
                    <span>Apply for Attachment</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                  <button onClick={() => document.getElementById('opportunities')?.scrollIntoView({behavior: 'smooth'})} className="px-xl py-md rounded-lg font-label-md text-label-md border-2 border-on-primary text-on-primary hover:bg-on-primary hover:text-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 text-center">
                    View Openings
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Platform Benefits */}
        <section className="py-3xl px-gutter" style={{ width: "100%", maxWidth: "1440px", margin: "0 auto" }}>
          <div className="text-center mb-xl flex flex-col items-center" style={{ width: "100%" }}>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-sm" style={{ width: "100%" }}>Why Join KICD?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant" style={{ width: "100%", maxWidth: "700px" }}>Our attachment program is designed to provide practical skills and deep insights into the educational sector.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <FadeInSection delay={0}>
              <div className="glass-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-start border border-border-light overflow-hidden">
                <img src="/kicd_professional_growth.png" alt="Professional Growth" className="w-full h-48 object-cover" />
                <div className="p-lg flex flex-col gap-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Professional Growth</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Gain invaluable hands-on experience working alongside industry experts in curriculum design and educational technology.</p>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={150}>
              <div className="glass-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-start border border-border-light overflow-hidden">
                <img src="/kicd_expert_mentorship.png" alt="Expert Mentorship" className="w-full h-48 object-cover" />
                <div className="p-lg flex flex-col gap-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Expert Mentorship</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Receive guidance and structured feedback from seasoned professionals dedicated to nurturing new talent in the field.</p>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection delay={300}>
              <div className="glass-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col items-start border border-border-light overflow-hidden">
                <img src="/kicd_innovation_education.png" alt="Innovation in Education" className="w-full h-48 object-cover" />
                <div className="p-lg flex flex-col gap-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Innovation in Education</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Contribute to forward-thinking projects that directly impact the national education ecosystem and learner outcomes.</p>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* Open Opportunities */}
        <section id="opportunities" className="py-3xl px-gutter bg-surface-container-lowest max-w-[1440px] mx-auto rounded-3xl mb-3xl border border-border-light shadow-sm">
          <div className="flex justify-between items-end mb-xl border-b border-border-light pb-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-primary mb-xs">Current Opportunities</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Explore departments currently accepting attachment applications.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            
            {!loading && error && (
              <div className="col-span-1 md:col-span-3 text-center text-red-500 py-4 font-body-md">
                Failed to load opportunities. Please try again later.
              </div>
            )}

            {!loading && !error && opportunities.length === 0 && (
              <div className="col-span-1 md:col-span-3 text-center py-12 bg-surface rounded-xl border border-border-light">
                <span className="material-symbols-outlined text-text-secondary text-[48px] mb-md">event_busy</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">No open opportunities right now</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Check back soon for new attachment placements.</p>
              </div>
            )}

            {!loading && !error && opportunities.length > 0 && opportunities.map((opp, idx) => {
              // Cycle through primary, secondary, tertiary colors for icons based on index
              const iconColors = [
                { bg: "bg-primary-fixed", text: "text-primary", icon: "menu_book" },
                { bg: "bg-secondary-fixed", text: "text-secondary", icon: "computer" },
                { bg: "bg-tertiary-fixed", text: "text-tertiary", icon: "movie" }
              ];
              const colorTheme = iconColors[idx % 3];

              return (
                <FadeInSection key={opp.opportunityId} delay={idx * 100}>
                  <div className="bg-surface rounded-xl border border-border-light flex flex-col hover:bg-surface-subtle transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md overflow-hidden">
                    <div className="relative w-full h-48">
                      <img src={opp.imageUrl ? (opp.imageUrl.startsWith("http") || opp.imageUrl.startsWith("/kicd_") ? opp.imageUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081'}${opp.imageUrl}`) : "/kicd_professional_growth.png"} alt={opp.title} className="w-full h-full object-cover" />
                      <div className="absolute top-4 right-4 px-sm py-xs bg-surface/90 text-success rounded-full font-label-sm text-label-sm shadow-sm backdrop-blur-md">
                        {opp.numberOfSlots} Positions
                      </div>
                    </div>
                    <div className="p-md flex flex-col flex-grow">
                      <span className="text-xs font-bold uppercase tracking-wider mb-2 text-text-secondary">{opp.departmentName}</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{opp.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg flex-grow line-clamp-2">{opp.description}</p>
                    <div className="flex justify-between items-center pt-md border-t border-border-light">
                      <span className="font-label-sm text-label-sm text-text-secondary flex items-center gap-xs">
                        <span className="material-symbols-outlined text-sm">schedule</span> Closes: {new Date(opp.applicationDeadline).toLocaleDateString()}
                      </span>
                      <button onClick={() => handleApply(opp.opportunityId, opp.departmentId)} className="px-md py-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-95">
                        Apply Now
                      </button>
                    </div>
                  </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
