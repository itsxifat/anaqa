// Shared renderer for About Us, Terms, and Privacy Policy pages
export default function StaticPageRenderer({ data }) {
  if (!data) return null;

  return (
    <article className="font-manrope">
      {/* Hero */}
      {(data.heroImage || data.heroHeading) && (
        <div className="relative w-full overflow-hidden bg-gray-900">
          {data.heroImage && (
            <img
              src={data.heroImage}
              alt={data.heroHeading || data.title}
              className="w-full h-[320px] md:h-[420px] object-cover opacity-60"
            />
          )}
          <div className={`${data.heroImage ? 'absolute inset-0' : ''} flex flex-col items-center justify-center text-center px-4 py-20`}>
            {data.heroHeading && (
              <h1 className="font-bodoni text-4xl md:text-6xl text-white font-medium leading-tight">
                {data.heroHeading}
              </h1>
            )}
            {data.heroSubheading && (
              <p className="text-white/70 text-sm md:text-base mt-4 max-w-xl">
                {data.heroSubheading}
              </p>
            )}
          </div>
        </div>
      )}

      {/* No hero — plain title */}
      {!data.heroImage && !data.heroHeading && (
        <div className="bg-[#F9F7F4] py-16 px-4 text-center border-b border-gray-100">
          <h1 className="font-bodoni text-4xl md:text-5xl text-gray-900">{data.title}</h1>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-12">
        {data.sections?.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="font-bodoni text-2xl md:text-3xl text-gray-900 mb-5 pb-3 border-b border-gray-100">
                {section.heading}
              </h2>
            )}
            {section.body && (
              <div
                className="prose prose-sm prose-gray max-w-none leading-relaxed text-gray-600"
                dangerouslySetInnerHTML={{ __html: section.body }}
              />
            )}
          </section>
        ))}

        {/* Team Members (About Us) */}
        {data.teamMembers?.length > 0 && (
          <section>
            <h2 className="font-bodoni text-2xl md:text-3xl text-gray-900 mb-8 pb-3 border-b border-gray-100">
              Our Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {data.teamMembers.map((member, i) => (
                <div key={i} className="text-center">
                  {member.image && (
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gray-100">
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {!member.image && (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="font-bodoni text-2xl text-[#D4AF37]">{member.name?.charAt(0)}</span>
                    </div>
                  )}
                  <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                  <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-widest mt-0.5">{member.role}</p>
                  {member.bio && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
