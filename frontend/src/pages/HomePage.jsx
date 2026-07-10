import { Link } from 'react-router-dom'
import {
  FiClipboard, FiBell, FiMapPin,
  FiUserPlus, FiSearch, FiCheckCircle
} from 'react-icons/fi'

export default function Home() {
  return (
    <main className="pt-16">

      {/* ─── 1. HERO ─────────────────────────────────────────────── */}
      <section className="
        bg-white dark:bg-dark-bg
        min-h-[92vh] flex items-center relative overflow-hidden
      ">
        <div className="
          absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full
          bg-blue-500/5 dark:bg-blue-900/20 blur-3xl pointer-events-none
        "/>

        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">

          <div>
            <span className="
              inline-block mb-4 px-3 py-1 rounded-full
              text-xs font-semibold tracking-widest uppercase
              bg-blue-50 dark:bg-blue-900/30
              text-blue-600 dark:text-blue-400
            ">
              School Applications, Simplified
            </span>

            <h1 className="
              font-display text-4xl md:text-5xl lg:text-6xl font-bold
              text-light-text dark:text-dark-text
              leading-tight mb-6
            ">
              Apply to Any School,{' '}
              <span className="text-blue-600 dark:text-blue-400">
                From One Place.
              </span>
            </h1>

            <p className="text-light-muted dark:text-dark-muted text-lg leading-relaxed mb-8 max-w-md">
              SchoolApply connects parents, students, and school administrators
              on a single platform — making primary and high school applications
              clear, fast, and stress-free.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="
                px-6 py-3 rounded-lg font-semibold text-white
                bg-blue-600 hover:bg-blue-700 transition-colors
              ">
                Start Your Application
              </Link>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="
                  px-6 py-3 rounded-lg font-semibold
                  text-blue-600 dark:text-blue-400
                  border border-blue-200 dark:border-blue-900
                  hover:bg-blue-50 dark:hover:bg-blue-900/20
                  transition-colors cursor-pointer bg-transparent
                "
              >
                Learn How It Works
              </button>
            </div>
          </div>

          {/* Right: mock status card */}
          <div className="hidden md:block">
            <div className="
              bg-light-surface dark:bg-dark-surface
              border border-light-border dark:border-dark-border
              rounded-2xl p-6 space-y-4 shadow-lg
            ">
              {[
                { school: 'Pretoria High School', status: 'Under Review', color: 'text-blue-500'  },
                { school: "St John's College",    status: 'Accepted',     color: 'text-green-500' },
                { school: 'Northcliff Primary',   status: 'Submitted',    color: 'text-blue-400'  },
              ].map(item => (
                <div key={item.school} className="
                  flex items-center justify-between
                  bg-light-bg dark:bg-dark-bg
                  rounded-xl px-4 py-3
                ">
                  <div>
                    <p className="text-light-text dark:text-dark-text text-sm font-medium">{item.school}</p>
                    <p className="text-light-muted dark:text-dark-muted text-xs mt-0.5">Application #2025</p>
                  </div>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                </div>
              ))}
              <p className="text-center text-light-muted dark:text-dark-muted text-xs pt-1">
                Track all your applications in real time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. STATS STRIP ──────────────────────────────────────── */}
      <section className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { number: '1 200+', label: 'Applications Processed' },
            { number: '85+',    label: 'Partner Schools'        },
            { number: '3 min',  label: 'Average Apply Time'     },
            { number: '98%',    label: 'Parent Satisfaction'    },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-white text-3xl font-bold">{stat.number}</p>
              <p className="text-blue-100 text-sm mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. FEATURES (About) ─────────────────────────────────── */}
      {/* id="about" allows the Navbar "About" button to scroll here */}
      <section id="about" className="py-24 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">
              What We Offer
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text">
              Everything You Need to Apply
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiClipboard className="w-6 h-6" />,
                title: 'One Application Form',
                desc:  "Fill in your child's details once and apply to multiple schools without repeating yourself.",
              },
              {
                icon: <FiBell className="w-6 h-6" />,
                title: 'Real-Time Status Updates',
                desc:  'Get notified the moment a school reviews, accepts, or requests more information from you.',
              },
              {
                icon: <FiMapPin className="w-6 h-6" />,
                title: 'School Directory',
                desc:  'Browse registered primary and high schools, compare them, and apply directly from their profile.',
              },
            ].map(feature => (
              <div
                key={feature.title}
                className="
                  bg-light-surface dark:bg-dark-surface
                  border border-light-border dark:border-dark-border
                  rounded-2xl p-6 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900
                  transition-all
                "
              >
                <div className="
                  w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                  bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400
                ">
                  {feature.icon}
                </div>
                <h3 className="text-light-text dark:text-dark-text font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-light-muted dark:text-dark-muted text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. HOW IT WORKS ─────────────────────────────────────── */}
      {/* id="how-it-works" allows the Navbar "How It Works" button to scroll here */}
      <section id="how-it-works" className="py-24 bg-light-surface dark:bg-dark-surface">
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-16">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3">
              Simple Process
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text">
              How It Works
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                step:  '01',
                icon:  <FiUserPlus className="w-5 h-5" />,
                title: 'Create Your Account',
                desc:  "Register as a parent and add your child's information. It only takes a few minutes.",
              },
              {
                step:  '02',
                icon:  <FiSearch className="w-5 h-5" />,
                title: 'Choose Your Schools',
                desc:  'Browse the directory and select the schools you want to apply to.',
              },
              {
                step:  '03',
                icon:  <FiCheckCircle className="w-5 h-5" />,
                title: 'Submit & Track',
                desc:  'Submit your application and follow its status in real time — all from your dashboard.',
              },
            ].map(item => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="
                  flex-shrink-0 w-12 h-12 rounded-full
                  bg-blue-600 dark:bg-blue-700
                  flex items-center justify-center
                  text-white font-bold text-sm
                ">
                  {item.step}
                </div>
                <div className="pt-2">
                  <h3 className="text-light-text dark:text-dark-text font-semibold text-lg mb-1 flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">{item.icon}</span>
                    {item.title}
                  </h3>
                  <p className="text-light-muted dark:text-dark-muted text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. CTA BANNER ───────────────────────────────────────── */}
      <section className="py-24 bg-blue-600 dark:bg-blue-950">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find the Right School?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of parents who have simplified their school application
            process with SchoolApply.
          </p>
          <Link to="/register" className="
            inline-block px-8 py-4 rounded-xl font-semibold text-blue-600
            bg-white hover:bg-blue-50 transition-colors text-lg
          ">
            Create a Free Account
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="
        bg-white dark:bg-dark-bg
        border-t border-light-border dark:border-dark-border
        py-8 text-center
      ">
        <p className="text-light-muted dark:text-dark-muted text-sm">
          © 2025 SchoolApply. Built for South African schools.
        </p>
      </footer>

    </main>
  )
}