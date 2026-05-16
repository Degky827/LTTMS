import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FaLeaf, FaHandshake, FaShieldAlt, FaGlobe, FaUsers, FaStar, FaChevronRight, FaHeart, FaCompass, FaCheckCircle } from 'react-icons/fa'
import Link from 'next/link'
import { lakeTanaHistorySources, lakeTanaHistoryTimeline } from '../data/lakeTanaHistory'

export default function About() {
  const features = [
    {
      icon: <FaLeaf />,
      title: 'Eco-Tourism Focus',
      description: 'Promoting sustainable tourism that preserves Lake Tana\'s natural beauty and cultural heritage',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: <FaHandshake />,
      title: 'Support Local Vendors',
      description: 'Empowering local businesses and communities through digital marketplace access',
      color: 'from-amber-500 to-orange-600'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Booking',
      description: 'Safe and reliable online payment system with verified vendors',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <FaGlobe />,
      title: 'Easy Access',
      description: 'Browse, book, and manage your Lake Tana experience from anywhere',
      color: 'from-purple-500 to-indigo-600'
    }
  ]

  const values = [
    {
      icon: '🌍',
      title: 'Sustainability',
      description: 'Protecting Lake Tana\'s ecosystem for future generations'
    },
    {
      icon: '🤝',
      title: 'Community',
      description: 'Empowering local families and businesses'
    },
    {
      icon: '🎨',
      title: 'Culture',
      description: 'Preserving Ethiopian heritage and traditions'
    },
    {
      icon: '💎',
      title: 'Authenticity',
      description: 'Genuine experiences, not tourist traps'
    },
    {
      icon: '🛡️',
      title: 'Trust',
      description: 'Verified vendors and secure transactions'
    },
    {
      icon: '❤️',
      title: 'Passion',
      description: 'Love for Ethiopia and its people'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/bgservice.avif" 
            alt="About Lake Tana Tourism" 
            className="w-full h-full object-cover scale-110 animate-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaLeaf className="mr-2 text-green-300" />
                <span className="text-white text-sm font-medium">Our Story</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                More Than <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Tourism</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-xl">
                A movement to preserve Ethiopia's natural wonders while empowering local communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Lake Tana */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-full px-4 py-2 mb-6">
                <FaCompass className="mr-2 text-primary" />
                <span className="text-primary font-semibold">Natural Wonder</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                The Heart of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Ethiopia</span>
              </h2>
              
              <div className="space-y-6 text-gray-700 text-lg">
                <p>
                  Lake Tana is Ethiopia's largest lake and the source of the legendary Blue Nile River. 
                  Spanning 3,600 square kilometers at 1,788 meters elevation, this magnificent body of water 
                  is more than just a lake—it's a living museum of Ethiopian history and culture.
                </p>
                <p>
                  Home to 37 islands, many sheltering ancient monasteries from the 13th and 14th centuries, 
                  Lake Tana preserves centuries of Ethiopian Orthodox Christian heritage through priceless 
                  art, manuscripts, and spiritual traditions.
                </p>
                <p>
                  The lake's rich biodiversity includes numerous endemic fish species and serves as a vital 
                  habitat for migratory birds. The surrounding wetlands and papyrus beds create a unique 
                  ecosystem that has sustained local communities for generations.
                </p>
              </div>
              
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl">
                  <div className="text-3xl mb-3">🏛️</div>
                  <div className="font-bold text-gray-900">37 Islands</div>
                  <div className="text-gray-600 text-sm">With ancient monasteries</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl">
                  <div className="text-3xl mb-3">🐟</div>
                  <div className="font-bold text-gray-900">15+ Species</div>
                  <div className="text-gray-600 text-sm">Endemic fish species</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/images/LakeTana.jpg" 
                  alt="Lake Tana - Ethiopia's Largest Lake" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-6">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 mb-2">
                  3,600 km²
                </div>
                <div className="text-gray-600 font-medium">Surface Area</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Timeline */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Lake Tana <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">History</span>
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              A concise timeline prepared for travelers who want historical context before visiting the islands, monasteries, and wetlands.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/20 mb-12">
            <img
              src="/images/lake-tana-history.svg"
              alt="Lake Tana historical timeline illustration"
              className="w-full h-auto"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lakeTanaHistoryTimeline.map((item) => (
              <div key={item.title} className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-6">
                <p className="text-cyan-200 text-sm font-semibold uppercase tracking-wider mb-2">{item.period}</p>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-blue-100">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white/10 border border-white/20 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Research Sources</h3>
            <div className="space-y-2">
              {lakeTanaHistorySources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-cyan-200 hover:text-cyan-100 underline underline-offset-4"
                >
                  {source.label}
                </a>
              ))}
            </div>
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A digital bridge connecting conscious travelers with authentic Ethiopian experiences
            </p>
          </div>

          <div className="max-w-4xl mx-auto text-gray-700 text-lg space-y-8 mb-16">
            <p>
              Lake Tana Tourism is more than just a booking platform—it's a movement toward 
              responsible travel. We've created a comprehensive digital marketplace that connects 
              travelers with authentic eco-tourism experiences while ensuring local communities 
              benefit directly from tourism.
            </p>
            <p>
              Our platform provides a centralized booking system where visitors can discover and 
              reserve monastery tours, traditional tankwa boat rides, eco-friendly accommodations, 
              and authentic dining experiences. Every transaction supports environmental conservation 
              and community development initiatives.
            </p>
            <p>
              For local vendors, we offer powerful tools to manage listings, track bookings, and 
              grow their businesses through increased visibility. Our rigorous verification process 
              ensures quality and reliability, building trust between travelers and service providers.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
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

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">Values</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Lake Tana Tourism
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <div 
                key={idx} 
                className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
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
                <FaCompass className="mr-2" />
                <span className="font-semibold">Our Purpose</span>
              </div>
              
              <h3 className="text-3xl font-bold mb-8">Our Mission</h3>
              <p className="text-xl text-blue-100 mb-8">
                To revolutionize eco-tourism around Lake Tana by creating meaningful connections 
                between travelers and local communities while preserving Ethiopia's natural and 
                cultural heritage for future generations.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaCheckCircle className="text-cyan-300 mr-3" />
                  <span className="text-blue-100">Promote sustainable tourism practices</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-cyan-300 mr-3" />
                  <span className="text-blue-100">Support local economic development</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-cyan-300 mr-3" />
                  <span className="text-blue-100">Preserve cultural heritage</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-cyan-300 mr-3" />
                  <span className="text-blue-100">Protect natural ecosystems</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12 text-white">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaStar className="mr-2" />
                <span className="font-semibold">Our Future</span>
              </div>
              
              <h3 className="text-3xl font-bold mb-8">Our Vision</h3>
              <p className="text-xl text-emerald-100 mb-8">
                To become Ethiopia's leading platform for responsible travel, setting global 
                standards for community-focused tourism that balances visitor experience with 
                environmental stewardship and cultural preservation.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-300 mr-3" />
                  <span className="text-emerald-100">Expand to 10,000+ local vendors</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-300 mr-3" />
                  <span className="text-emerald-100">Reach 100,000+ conscious travelers annually</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-300 mr-3" />
                  <span className="text-emerald-100">Establish conservation partnerships</span>
                </div>
                <div className="flex items-center">
                  <FaCheckCircle className="text-emerald-300 mr-3" />
                  <span className="text-emerald-100">Create educational programs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 mb-2">
                  500+
                </div>
                <div className="text-gray-600 font-medium">Happy Travelers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-600 mb-2">
                  50+
                </div>
                <div className="text-gray-600 font-medium">Local Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 mb-2">
                  95%
                </div>
                <div className="text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 mb-2">
                  100%
                </div>
                <div className="text-gray-600 font-medium">Eco-Certified</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <FaHeart className="mr-2 text-rose-300" />
                <span className="text-white text-sm font-medium">Join Our Community</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Ready to Make a <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">Difference</span>?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Whether you're a traveler seeking authentic experiences or a vendor looking to grow your business, 
                join us in creating sustainable tourism that benefits everyone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/services" 
                  className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <span>Explore Experiences</span>
                  <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/vendor/login" 
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
                >
                  <span>Become a Vendor</span>
                  <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
