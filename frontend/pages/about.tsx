import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaLeaf, FaHandshake, FaShieldAlt, FaGlobe, FaStar, FaChevronRight, FaHeart, FaCompass, FaCheckCircle, FaWater, FaMapMarkerAlt, FaChurch, FaBookOpen, FaTree, FaShip } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  const features = [
    { icon: <FaLeaf />, title: 'Eco-Tourism Focus', description: 'Promoting sustainable tourism that preserves Lake Tana\'s natural beauty and cultural heritage', color: 'from-emerald-500 to-green-600' },
    { icon: <FaHandshake />, title: 'Support Local Vendors', description: 'Empowering local businesses and communities through digital marketplace access', color: 'from-amber-500 to-orange-600' },
    { icon: <FaShieldAlt />, title: 'Secure Booking', description: 'Safe and reliable online payment system with verified vendors', color: 'from-blue-500 to-cyan-600' },
    { icon: <FaGlobe />, title: 'Easy Access', description: 'Browse, book, and manage your Lake Tana experience from anywhere', color: 'from-purple-500 to-indigo-600' },
  ]

  const values = [
    { icon: '🌍', title: 'Sustainability', description: 'Protecting Lake Tana\'s ecosystem for future generations' },
    { icon: '🤝', title: 'Community', description: 'Empowering local families and businesses' },
    { icon: '🎨', title: 'Culture', description: 'Preserving Ethiopian heritage and traditions' },
    { icon: '💎', title: 'Authenticity', description: 'Genuine experiences, not tourist traps' },
    { icon: '🛡️', title: 'Trust', description: 'Verified vendors and secure transactions' },
    { icon: '❤️', title: 'Passion', description: 'Love for Ethiopia and its people' },
  ]

  const sections = [
    {
      id: 'geography',
      icon: <FaMapMarkerAlt />,
      title: 'Geography & Location',
      color: 'from-blue-500 to-cyan-600',
      facts: [
        { label: 'Surface Area', value: '3,200–3,673 km²' },
        { label: 'Length', value: '84 km' },
        { label: 'Width', value: '66 km' },
        { label: 'Max Depth', value: '~15 m' },
        { label: 'Elevation', value: '~1,788 m' },
      ],
      content: [
        'Lake Tana is the largest lake in Ethiopia, located in the Amhara Region in the north‑western Ethiopian Highlands. Its coordinates are approximately 12°N, 37°E. The lake\'s surface area varies seasonally between 3,200 and 3,673 km², with a length of 84 km and a width of 66 km. Its maximum depth reaches approximately 15 meters, sitting at an elevation of about 1,788 meters above sea level.',
      ]
    },
    {
      id: 'hydrology',
      icon: <FaWater />,
      title: 'Hydrology',
      color: 'from-sky-500 to-blue-600',
      content: [
        'The lake is fed by several primary inflows: the Gilgel Abay, Gumara, Reb, Megech, and Kilti rivers. Its sole outflow is the Blue Nile River (locally called Abbay), which begins at Bahir Dar. The flow is seasonally regulated via a control weir at the Blue Nile outlet. Downstream, the river creates the spectacular Blue Nile Falls (Tis Issat / Tis Abbay), one of Ethiopia\'s most famous natural landmarks.',
      ]
    },
    {
      id: 'islands',
      icon: <FaChurch />,
      title: 'Islands & Monasteries',
      color: 'from-purple-500 to-indigo-600',
      facts: [
        { label: 'Islands', value: '21–45' },
        { label: 'Active Monasteries', value: '20+' },
        { label: 'Oldest Monastery', value: 'Tana Qirqos' },
      ],
      content: [
        'Lake Tana contains numerous islands, historically counted between 21 and 45 depending on the water level. These islands are home to some of Ethiopia\'s most remarkable monasteries, including Tana Qirqos, Daga Island, Dek Island, and the Zege Peninsula. These monastic communities preserve ancient manuscripts, icons, and religious art dating back centuries, making the lake a living museum of Ethiopian Orthodox Christian heritage.',
      ]
    },
    {
      id: 'history',
      icon: <FaBookOpen />,
      title: 'History & Culture',
      color: 'from-amber-500 to-orange-600',
      content: [
        'Lake Tana was formed by volcanic activity approximately 5 million years ago. In ancient times, it was known to Greek scholars as Pseboa or Koloe. During the 16th–17th centuries, Portuguese Jesuits visited the lake\'s monasteries and documented their findings. The Scottish explorer James Bruce reached Lake Tana in 1770 while famously seeking the source of the Nile River, cementing the lake\'s place in the history of exploration.',
      ]
    },
    {
      id: 'ecology',
      icon: <FaTree />,
      title: 'Ecological & Economic Importance',
      color: 'from-emerald-500 to-green-600',
      facts: [
        { label: 'UNESCO Reserve', value: 'Since 2015' },
        { label: 'Endemic Fish', value: '15+ Species' },
        { label: 'Bird Species', value: '300+' },
      ],
      content: [
        'In 2015, Lake Tana was declared a UNESCO Biosphere Reserve in recognition of its outstanding biodiversity and cultural heritage. The lake supports traditional fishing using papyrus boats called tanqua, as well as agriculture including grains, coffee, and oilseeds, and cattle raising. Its rich birdlife and endemic species make it a premier destination for eco‑tourism and bird‑watching.',
      ]
    },
    {
      id: 'tourism',
      icon: <FaShip />,
      title: 'Tourism Significance',
      color: 'from-teal-500 to-cyan-600',
      content: [
        'Lake Tana\'s attractions include ancient monasteries, the Blue Nile Falls, eco‑lodges, boat tours, and world‑class bird‑watching. The city of Bahir Dar serves as the main gateway for visitors, offering easy access to all lake activities. The region is increasingly promoted as a sustainable tourism hub in Ethiopia, balancing visitor experience with environmental conservation and community benefit.',
      ]
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* Hero */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/aboutpage.jpg" alt="About Lake Tana" fill className="object-cover scale-110 animate-zoom" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaCompass className="mr-2 text-cyan-300" />
                <span className="text-white text-sm font-medium">Discover Ethiopia's Largest Lake</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Lake Tana</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-xl">
                Cultural, historical, and ecological overview of Lake Tana and Bahir Dar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 1–6: Lake Tana Background Sections ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {sections.map((sec, idx) => (
          <section key={sec.id} id={sec.id}>
            <div className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
              {/* Text */}
              <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className={`inline-flex items-center bg-gradient-to-r ${sec.color}/10 rounded-full px-4 py-2 mb-4`}>
                  <span className={`mr-2 ${sec.color.replace('from-', 'text-').split(' ')[0]}`}>{sec.icon}</span>
                  <span className={`font-semibold text-sm ${sec.color.replace('from-', 'text-').split(' ')[0]}`}>{sec.title}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{sec.title}</h2>
                {sec.content.map((p, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed mb-4">{p}</p>
                ))}

                {/* Quick Facts */}
                {sec.facts && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                    {sec.facts.map((f, j) => (
                      <div key={j} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                        <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">{f.value}</div>
                        <div className="text-xs text-gray-500 font-semibold mt-1">{f.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual */}
              <div className={`relative ${idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                <div className={`rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${sec.color} p-1`}>
                  <div className="bg-white rounded-2xl p-8 h-full">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${sec.color} flex items-center justify-center text-white text-4xl shadow-lg`}>
                      {sec.icon}
                    </div>
                    <div className="text-center space-y-4">
                      {sec.facts ? sec.facts.map((f, j) => (
                        <div key={j} className="p-4 bg-gray-50 rounded-xl">
                          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">{f.value}</div>
                          <div className="text-sm text-gray-600 font-medium">{f.label}</div>
                        </div>
                      )) : (
                        <div className="p-6">
                          <FaLeaf className="text-6xl text-emerald-300 mx-auto mb-4" />
                          <p className="text-gray-500 italic">Lake Tana Eco-Tourism</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Floating decoration */}
                <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-gradient-to-br ${sec.color} opacity-20 blur-xl -z-10`}></div>
              </div>
            </div>
          </section>
        ))}

        {/* Sources */}
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaBookOpen className="text-primary" /> Research Sources</h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Wikipedia — Lake Tana', url: 'https://en.wikipedia.org/wiki/Lake_Tana' },
              { label: 'Britannica — Lake Tana', url: 'https://www.britannica.com/place/Lake-Tana' },
              { label: 'UNESCO Biosphere Reserve', url: 'https://en.wikipedia.org/wiki/Lake_Tana' },
              { label: 'World Places Explained', url: 'https://www.worldplacesexplained.com/places/lake-tana' },
            ].map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm">
                <FaGlobe className="text-primary" /> {s.label} <FaChevronRight className="text-xs" />
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Historical Timeline */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Historical <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Timeline</span>
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              Key moments in Lake Tana's 5-million-year journey from volcanic formation to UNESCO Biosphere Reserve.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 mb-12">
            <Image src="/images/lake-tana-history.svg" alt="Lake Tana historical timeline" width={1200} height={400} className="w-full h-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { period: '~5 million years ago', title: 'Volcanic Formation', description: 'Lake Tana formed by volcanic activity that blocked the Blue Nile valley, creating the largest lake in Ethiopia.' },
              { period: 'Ancient Era', title: 'Known to Greek Scholars', description: 'Ancient Greeks referred to Lake Tana as Pseboa or Koloe, recognizing it as a significant geographical feature.' },
              { period: '16th–17th Century', title: 'Portuguese Jesuit Missions', description: 'Portuguese Jesuits visited the lake\'s island monasteries, documenting their art, manuscripts, and religious practices.' },
              { period: '1770', title: 'James Bruce Expedition', description: 'Scottish explorer James Bruce reached Lake Tana while seeking the source of the Blue Nile, a landmark in African exploration.' },
              { period: '2015', title: 'UNESCO Biosphere Reserve', description: 'Lake Tana declared a UNESCO Biosphere Reserve for its outstanding biodiversity, cultural heritage, and sustainable development potential.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-all">
                <p className="text-cyan-200 text-sm font-semibold uppercase tracking-wider mb-2">{item.period}</p>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-blue-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Platform */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Platform</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">A digital bridge connecting conscious travelers with authentic Ethiopian experiences</p>
          </div>

          <div className="max-w-4xl mx-auto text-gray-700 text-lg space-y-8 mb-16">
            <p>Lake Tana Tourism is more than just a booking platform—it's a movement toward responsible travel. We've created a comprehensive digital marketplace that connects travelers with authentic eco-tourism experiences while ensuring local communities benefit directly from tourism.</p>
            <p>Our platform provides a centralized booking system where visitors can discover and reserve monastery tours, traditional tankwa boat rides, eco-friendly accommodations, and authentic dining experiences. Every transaction supports environmental conservation and community development initiatives.</p>
            <p>For local vendors, we offer powerful tools to manage listings, track bookings, and grow their businesses through increased visibility. Our rigorous verification process ensures quality and reliability, building trust between travelers and service providers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12 text-white">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaCompass className="mr-2" /><span className="font-semibold">Our Purpose</span>
              </div>
              <h3 className="text-3xl font-bold mb-8">Our Mission</h3>
              <p className="text-xl text-blue-100 mb-8">To revolutionize eco-tourism around Lake Tana by creating meaningful connections between travelers and local communities while preserving Ethiopia's natural and cultural heritage for future generations.</p>
              <div className="space-y-4">
                {['Promote sustainable tourism practices', 'Support local economic development', 'Preserve cultural heritage', 'Protect natural ecosystems'].map((m, i) => (
                  <div key={i} className="flex items-center"><FaCheckCircle className="text-cyan-300 mr-3" /><span className="text-blue-100">{m}</span></div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12 text-white">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaStar className="mr-2" /><span className="font-semibold">Our Future</span>
              </div>
              <h3 className="text-3xl font-bold mb-8">Our Vision</h3>
              <p className="text-xl text-emerald-100 mb-8">To become Ethiopia's leading platform for responsible travel, setting global standards for community-focused tourism that balances visitor experience with environmental stewardship and cultural preservation.</p>
              <div className="space-y-4">
                {['Expand to 10,000+ local vendors', 'Reach 100,000+ conscious travelers annually', 'Establish conservation partnerships', 'Create educational programs'].map((v, i) => (
                  <div key={i} className="flex items-center"><FaCheckCircle className="text-emerald-300 mr-3" /><span className="text-emerald-100">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Values</span></h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">The principles that guide everything we do at Lake Tana Tourism</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{value.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-32 -translate-x-32"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaHeart className="mr-2 text-rose-300" /><span className="text-white text-sm font-medium">Join Our Community</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Ready to Make a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Difference</span>?</h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Whether you're a traveler seeking authentic experiences or a vendor looking to grow your business, join us in creating sustainable tourism that benefits everyone.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/services" className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <span>Explore Experiences</span><FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/login" className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <span>Become a Vendor</span><FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
