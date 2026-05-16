import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import {
  FaShip, FaHotel, FaStar, FaUsers, FaLeaf, FaShieldAlt,
  FaChevronRight, FaChurch, FaWater, FaTree, FaSearch,
  FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle,
  FaHandHoldingHeart, FaRecycle, FaHandsHelping,
  FaQuoteLeft, FaArrowRight, FaTwitter, FaFacebook,
  FaYoutube, FaLinkedin
} from 'react-icons/fa'
import { GiHummingbird, GiBoatFishing } from 'react-icons/gi'

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [activeDest, setActiveDest] = useState(0)

  const featuredDestinations = [
    {
      title: 'Zege Monastery',
      icon: <FaChurch size={32} />,
      description: 'Explore ancient monasteries on the Zege Peninsula, home to 14th-century churches and priceless religious art.',
      image: '/images/monastery.jpg',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Blue Nile Falls',
      icon: <FaWater size={32} />,
      description: 'Witness the thunderous "Smoking Water" — a 45-meter waterfall at the source of the Blue Nile.',
      image: '/images/waterfall.jpg',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Luxury Eco Lodge',
      icon: <FaHotel size={32} />,
      description: 'Stay in sustainable lakeside lodges with solar power, local materials, and stunning sunset views.',
      image: '/images/hotel.jpg',
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Bird Watching Trail',
      icon: <GiHummingbird size={32} />,
      description: 'Spot over 300 bird species along Lake Tana\'s pristine wetlands and forest trails.',
      image: '/images/Boat.jpg',
      color: 'from-emerald-500 to-teal-600'
    }
  ]

  const whyChooseUs = [
    { icon: <FaShieldAlt size={28} />, title: 'Secure Booking', desc: 'End-to-end encrypted payments with instant confirmation' },
    { icon: <FaLeaf size={28} />, title: 'Verified Eco Vendors', desc: 'All vendors certified for sustainable practices' },
    { icon: <FaCheckCircle size={28} />, title: 'Local Payment Integration', desc: 'Support local economies with direct payments' },
    { icon: <FaRecycle size={28} />, title: 'Sustainable Travel Commitment', desc: 'Carbon-offset programs and community reinvestment' }
  ]

  const ecoServices = [
    { icon: <GiBoatFishing size={36} />, title: 'Boat Tours on Lake Tana', desc: 'Sunset cruises and island-hopping adventures' },
    { icon: <FaChurch size={36} />, title: 'Cultural Heritage Walks', desc: 'Guided tours through ancient traditions' },
    { icon: <FaTree size={36} />, title: 'Eco Lodges & Resorts', desc: 'Sustainable lakeside accommodations' },
    { icon: <FaWater size={36} />, title: 'Monastery Excursions', desc: 'Visit centuries-old island monasteries' }
  ]

  const sustainabilityHighlights = [
    {
      icon: <FaHandHoldingHeart size={40} />,
      title: 'Support Local Communities',
      desc: '70% of every booking goes directly to local guides, drivers, and vendors.'
    },
    {
      icon: <FaTree size={40} />,
      title: 'Reduce Carbon Footprint',
      desc: 'All tours include carbon offset credits. We plant a tree per booking.'
    },
    {
      icon: <FaHandsHelping size={40} />,
      title: 'Volunteer for Conservation',
      desc: 'Join reforestation and lake clean-up projects during your stay.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Eco-Tourist from Canada',
      content: 'The monastery tours were breathtaking! The guides were knowledgeable and the whole experience felt authentic and sustainable.',
      rating: 5,
      image: '/images/testimonial1.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'Travel Blogger',
      content: 'Lake Tana Tourism made my Ethiopian adventure unforgettable. The boat ride at sunrise was magical!',
      rating: 5,
      image: '/images/testimonial2.jpg'
    },
    {
      name: 'Amina Hassan',
      role: 'Local Guide',
      content: 'As a local guide, I appreciate how this platform supports our community while promoting responsible tourism.',
      rating: 5,
      image: '/images/testimonial3.jpg'
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* ===== 1. Hero Banner with Search Bar ===== */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/fixedbgforhomepage.jpg"
            alt="Lake Tana - Discover Nature & Culture in Bahir Dar"
            fill
            className="object-cover scale-110 animate-zoom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-6">
              <FaLeaf className="mr-2 text-emerald-300" />
              <span className="text-white text-sm font-medium tracking-wide">Eco-Tourism Certified Destination</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
              Discover{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                Lake Tana
              </span>
              <br />
              <span className="text-2xl md:text-3xl lg:text-4xl font-normal text-gray-200">
                Explore Nature & Culture in Bahir Dar
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-200 max-w-2xl mx-auto">
              Immerse yourself in authentic Ethiopian experiences through sustainable travel
              that supports local communities and protects Lake Tana's natural beauty.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 mb-10">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white">
                  <FaMapMarkerAlt className="mr-3 text-cyan-300 shrink-0" />
                  <select className="bg-transparent w-full focus:outline-none text-white text-sm font-medium appearance-none cursor-pointer">
                    <option className="text-gray-900" value="">Destination</option>
                    <option className="text-gray-900" value="zege">Zege Peninsula</option>
                    <option className="text-gray-900" value="bluenile">Blue Nile Falls</option>
                    <option className="text-gray-900" value="bahirdar">Bahir Dar City</option>
                    <option className="text-gray-900" value="islands">Lake Tana Islands</option>
                  </select>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white">
                  <FaCalendarAlt className="mr-3 text-cyan-300 shrink-0" />
                  <input type="date" className="bg-transparent w-full focus:outline-none text-white text-sm [color-scheme:dark]" placeholder="Check-in" />
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white">
                  <FaCalendarAlt className="mr-3 text-cyan-300 shrink-0" />
                  <input type="date" className="bg-transparent w-full focus:outline-none text-white text-sm [color-scheme:dark]" placeholder="Check-out" />
                </div>
                <Link
                  href="/services"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-300 px-6 py-3"
                >
                  <FaSearch className="mr-2" />
                  Search
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <span>Explore Tours</span>
                <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/services"
                className="group bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <span>Book Now</span>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/eco-tourism"
                className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center"
              >
                <FaLeaf className="mr-2" />
                <span>Learn Eco Practices</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* ===== 2. Featured Destinations ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-full px-5 py-2 mb-4">
              <FaStar className="mr-2 text-primary" />
              <span className="text-primary font-semibold text-sm">Popular Destinations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Destinations
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked sustainable adventures for the conscious traveler
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDestinations.map((dest, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                </div>
                <div className="absolute top-4 left-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dest.color} flex items-center justify-center text-white shadow-lg`}>
                    {dest.icon}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{dest.title}</h3>
                  <p className="text-sm text-gray-200 mb-4 line-clamp-2">{dest.description}</p>
                  <Link
                    href="/services"
                    className="inline-flex items-center text-sm font-semibold text-cyan-300 hover:text-white transition-colors"
                  >
                    Book Now <FaChevronRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Why Choose Us ===== */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full px-5 py-2 mb-4">
              <FaCheckCircle className="mr-2 text-emerald-500" />
              <span className="text-emerald-600 font-semibold text-sm">Why Travel With Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                Choose Us
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make sustainable travel easy, secure, and impactful
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-1"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:from-primary group-hover:to-emerald-500 group-hover:text-white transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. Top Eco-Tourism Services ===== */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-full px-5 py-2 mb-4">
                <FaTree className="mr-2 text-primary" />
                <span className="text-primary font-semibold text-sm">Eco Selection</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Top{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  Eco-Tourism Services
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Curated sustainable experiences designed to connect you with nature and culture
              </p>
            </div>
            <Link
              href="/services"
              className="group mt-8 md:mt-0 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center shrink-0"
            >
              <span>View All Services</span>
              <FaChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecoServices.map((service, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-emerald-500/5 rounded-bl-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{service.desc}</p>
                  <Link
                    href="/services"
                    className="inline-flex items-center text-sm font-semibold text-primary hover:text-emerald-600 transition-colors"
                  >
                    Book Now <FaChevronRight className="ml-1 text-xs" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. Community & Sustainability Highlights ===== */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-4">
              <FaHandHoldingHeart className="mr-2 text-emerald-300" />
              <span className="text-emerald-100 font-semibold text-sm">Make a Difference</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Community &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                Sustainability
              </span>
            </h2>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Every journey you take helps protect Lake Tana and empowers local communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sustainabilityHighlights.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-emerald-100 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/eco-tourism"
              className="inline-flex items-center bg-white text-emerald-800 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>Learn More About Eco-Tourism</span>
              <FaChevronRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 6. Testimonials & Reviews ===== */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-4">
              <FaQuoteLeft className="mr-2 text-cyan-300" />
              <span className="text-cyan-100 font-semibold text-sm">Traveler Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Testimonials &{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                Reviews
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Hear from travelers who've experienced the magic of Lake Tana
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, idx) => (
                  <div key={idx} className="min-w-full px-4">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10 text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-2 border-cyan-400 ring-4 ring-cyan-400/20">
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex justify-center mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <FaStar key={i} className="text-yellow-400 mx-1 text-lg" />
                        ))}
                      </div>
                      <p className="text-gray-200 text-lg italic mb-8 max-w-2xl mx-auto leading-relaxed">
                        &ldquo;{testimonial.content}&rdquo;
                      </p>
                      <h4 className="text-xl font-bold text-white">{testimonial.name}</h4>
                      <p className="text-cyan-200 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    activeTestimonial === idx
                      ? 'bg-cyan-400 w-8'
                      : 'bg-white/30 hover:bg-white/50 w-3'
                  }`}
                />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/reviews"
                className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <FaStar className="mr-2" />
                <span>Share Your Experience</span>
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. Stats Strip ===== */}
      <section className="py-12 bg-gradient-to-r from-primary to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-white">500+</div>
              <div className="text-emerald-100 font-medium mt-1">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">50+</div>
              <div className="text-emerald-100 font-medium mt-1">Local Vendors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">95%</div>
              <div className="text-emerald-100 font-medium mt-1">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">100%</div>
              <div className="text-emerald-100 font-medium mt-1">Eco-Certified</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
