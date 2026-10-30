import Link from "next/link";
import { Building2, ExternalLink, MapPin, Phone } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { getHospitals } from "@/lib/hospitals";

export const dynamic = "force-dynamic";

export default async function HospitalsPage() {
  const hospitals = await getHospitals();

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#243331]">
      <SiteNav variant="back" backLabel="Back to home" />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">Hospital directory</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-[#1e3531] sm:text-5xl">
          Hospitals and care information
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#66766e]">
          Browse the locations, contact details, and services shared by hospitals in the Aayu Hub directory. Contact a hospital directly to confirm current information.
        </p>

        {hospitals.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {hospitals.map((hospital) => (
              <article
                className="rounded-2xl border border-[#e2e8e1] bg-white p-6 shadow-sm sm:p-7"
                key={hospital.id}
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]">
                    <Building2 size={23} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-[#2c433a]">{hospital.name}</h2>
                    <p className="mt-1 text-sm text-[#738078]">
                      {[hospital.city, hospital.state, hospital.postalCode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-base leading-7 text-[#596b64]">{hospital.description}</p>
                <div className="mt-5 space-y-3 border-t border-[#e8ede7] pt-4 text-sm text-[#53675d]">
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 shrink-0 text-[#39806d]" size={17} />
                    <span>{hospital.address}{hospital.city ? `, ${hospital.city}` : ""}{hospital.state ? `, ${hospital.state}` : ""}{hospital.postalCode ? ` ${hospital.postalCode}` : ""}</span>
                  </p>
                  {hospital.phone && (
                    <a className="inline-flex items-center gap-2 hover:text-[#287360]" href={`tel:${hospital.phone}`}>
                      <Phone size={17} className="text-[#39806d]" /> {hospital.phone}
                    </a>
                  )}
                  {hospital.website && (
                    <p>
                      <a className="inline-flex items-center gap-2 font-medium text-[#347361] hover:text-[#205b4d]" href={hospital.website} target="_blank" rel="noreferrer">
                        Visit website <ExternalLink size={16} />
                      </a>
                    </p>
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {hospital.specialties.map((specialty) => (
                    <span className="rounded-full bg-[#f0f6f1] px-3 py-1 text-xs font-medium text-[#456b59]" key={specialty}>
                      {specialty}
                    </span>
                  ))}
                </div>
                {hospital.emergencyServices && (
                  <p className="mt-5 inline-flex rounded-full border border-[#f2d5ce] bg-[#fff6f3] px-3 py-1 text-xs font-semibold text-[#9b493c]">
                    Emergency services listed
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-[#cbd9ce] bg-white p-8 text-center sm:p-12">
            <Building2 className="mx-auto text-[#6b927c]" size={32} />
            <h2 className="mt-4 text-xl font-semibold text-[#2c433a]">No hospitals listed yet</h2>
            <p className="mx-auto mt-2 max-w-lg text-base leading-7 text-[#687970]">
              Hospital information added by an administrator will appear here.
            </p>
            <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#347361] hover:text-[#205b4d]" href="/">
              Return to Aayu Hub
            </Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
