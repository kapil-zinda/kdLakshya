import React from 'react';

import {
  ArrowRight,
  Book,
  Building2,
  LineChart,
  Mail,
  Package,
  Phone,
} from 'lucide-react';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';
const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Client_Secreate =
  process.env.NEXT_PUBLIC_AUTH0_Client_Secreat || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const login_redirect = process.env.NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL || '';

export default function HomePageComponent() {
  const loginHandler = async () => {
    console.log('hello');
    try {
      window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${login_redirect}&scope=${encodeURIComponent('openid profile email')}`;
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          <span className="text-xl font-semibold">Finance Pro</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#pricing" className="hover:text-blue-400 px-4 py-2">
            Pricing
          </a>
          <a href="#contact" className="hover:text-blue-400 px-4 py-2">
            Contact
          </a>
          <button
            className="px-4 py-2 bg-slate-800 rounded-full text-sm"
            onClick={loginHandler}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="space-y-6">
          {/* <button className="px-4 py-2 bg-slate-800 rounded-full text-sm">
            JOIN THE FUTURE
          </button> */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Welcome to 10k Hours
            <br /> Simplify Your Task Managemen
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl">
            Easily manage tasks and projects with a customizable dashboard—track
            progress, collaborate, organize notes, and manage files all in one
            place.
          </p>
          <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700">
            <span>Let&apos;s get started</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 ">
        <div className="max-w-6xl mx-auto grid md:grid-cols-1 gap-12 ">
          <div className="space-y-8 ">
            <div className="space-y-4 bg-blue-950 p-4 rounded-sm">
              <LineChart className="w-12 h-12 text-blue-500" />
              <h3 className="text-2xl font-bold">
                Task Tracking & Visualization
              </h3>
              <p className="text-slate-400">
                Stay organized with intuitive tracking features, letting you
                manage tasks by status, priority, and category. Visualize
                progress through customizable charts and graphs.
              </p>
              <button className="flex items-center space-x-2 text-blue-500">
                <span>Learn more</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* <div className="space-y-4">
              <PiggyBank className="w-12 h-12 text-blue-500" />
              <h3 className="text-2xl font-bold">Comprehensive Debt Management</h3>
              <p className="text-slate-400">Navigate your financial journey with our Comprehensive Debt Management system.</p>
              <button className="flex items-center space-x-2 text-blue-500">
                <span>Learn more</span>
                <ArrowRight size={16} />
              </button>
            </div> */}
            <div className="space-y-4 text-right bg-blue-950 p-4 rounded-sm">
              {/* <PiggyBank className="w-12 h-12 text-blue-500 mx-auto md:mr-0" /> */}
              <Book className="w-12 h-12 text-blue-500 mx-auto md:mr-0" />
              <h3 className="text-2xl font-bold">Notes & Files Management</h3>
              <p className="text-slate-400">
                Keep important notes and files centralized and accessible to
                your team, so you always have the information you need at your
                fingertips.
              </p>
              <button className="w-full flex items-center justify-end space-x-2 text-blue-500 text-right">
                <span className="text-right">Learn more</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-4 bg-blue-950 p-4 rounded-sm">
              <Package className="w-12 h-12 text-blue-500" />
              <h3 className="text-2xl font-bold">Collaboration Tools</h3>
              <p className="text-slate-400">
                Work seamlessly with team creation, group notes, and file
                management. Collaborate efficiently and keep everyone aligned
                with shared resources.
              </p>
              <button className="flex items-center space-x-2 text-blue-500 ">
                <span>Learn more</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* <div className="relative">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="relative bg-slate-800 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold">Goal Progress</h4>
              <div className="flex justify-between">
                <div>
                  <div className="text-sm text-slate-400">Paid</div>
                  <div className="text-xl font-semibold">$3,290</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Remaining</div>
                  <div className="text-xl font-semibold">$1,840</div>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-blue-500"></div>
              </div>
            </div>
          </div> */}
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            {/* <span className="text-sm text-slate-400">FROM OUR BLOG</span> */}
            <h2 className="text-4xl font-bold">
              Plan that perfectly suits your financial needs
            </h2>
            <p className="text-slate-400">
              Discover plans tailored to your financial needs. Choose features
              that align with your financial goals.
            </p>
          </div>

          {/* <div className="flex justify-center space-x-4 mb-8">
            <button className="px-4 py-2 bg-slate-800 rounded-full">Monthly</button>
            <button className="px-4 py-2 bg-slate-800 rounded-full">Yearly</button>
            <span className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full">Save 30%</span>
          </div> */}

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Standard',
                price: '9',
                features: [
                  'Budget Tracking',
                  'Basic Bill Reminders',
                  'Expense Categorization',
                  'Email Support',
                  'Basic Analytics',
                ],
              },
              {
                title: 'Plus+',
                price: '19',
                features: [
                  'Advanced Budgeting',
                  'Bill Pay Reminders',
                  'Detailed Expense Reports',
                  'Priority Email Support',
                  'Advanced Analytics',
                ],
              },
              {
                title: 'Pro',
                price: '29',
                features: [
                  'Personalized Budgeting',
                  'Automatic Bill Payments',
                  'Comprehensive Analysis',
                  '24/7 Customer Support',
                  'Predictive Analytics',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.title}
                className="p-6 bg-white/5 rounded-xl space-y-6"
              >
                <h3 className="text-2xl font-semibold">{plan.title}</h3>
                <p className="text-slate-400">
                  Essential finance tools for budgeting and expense tracking.
                </p>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors">
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto space-y-8 text-center">
          <h2 className="text-4xl font-bold">
            Most used financial app
            <br />
            used by millions of happy users
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-slate-800/50 rounded-xl">
              <div className="text-3xl font-bold">150k+</div>
              <div className="text-slate-400">Active Customers</div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl">
              <div className="text-3xl font-bold">5%+</div>
              <div className="text-slate-400">Spending reduction</div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl">
              <div className="text-3xl font-bold">20%+</div>
              <div className="text-slate-400">Increase savings</div>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl">
              <div className="text-3xl font-bold">99k+</div>
              <div className="text-slate-400">Positive reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-6 py-20">
        <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">
                We would love to hear from you
              </h2>
              <p className="text-slate-400">
                Connect with us. We value your input. Together, we can create a
                better financial future. Let&apos;s start today.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building2 className="text-blue-500" />
                  <div>
                    <div className="font-semibold">Head Office</div>
                    <div className="text-slate-400">
                      5899 Finance Ave Suite 678, NR, Nevada, USA
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="text-blue-500" />
                  <div>
                    <div className="font-semibold">Phone</div>
                    <div className="text-slate-400">+1 234 567 890</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="text-blue-500" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-slate-400">contact@financepro.com</div>
                  </div>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 bg-slate-900 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 bg-slate-900 rounded-lg"
              />
              <textarea
                placeholder="Message"
                rows={4}
                className="w-full p-3 bg-slate-900 rounded-lg"
              ></textarea>
              <button className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
                Submit
              </button>
              <p className="text-sm text-slate-400 text-center">
                We will reach out to you about 24 hours in work days
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
