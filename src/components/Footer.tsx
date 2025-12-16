'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Heart,
  ExternalLink
} from 'lucide-react';
import { newsSources } from '@/data/sources';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Restez informé avec notre newsletter
              </h3>
              <p className="text-gray-400">
                Recevez le Brief Matinal directement dans votre boîte mail
              </p>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Votre email..."
                className="flex-1 lg:w-80 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35]"
              />
              <button className="btn-primary whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold">Mada-Flash</h4>
                <p className="text-xs text-gray-400">L'actu en bref</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Le portail d'agrégation d'actualités le plus rapide et le plus transparent de Madagascar. Toutes les informations essentielles en un seul endroit.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-[#ff6b35] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-[#ff6b35] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-[#ff6b35] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-[#ff6b35] transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Nos Sources */}
          <div>
            <h4 className="font-semibold mb-4 text-[#ff6b35]">Nos Sources</h4>
            <ul className="space-y-2">
              {newsSources.slice(0, 8).map((source) => (
                <li key={source.id}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: source.color }}
                    ></span>
                    {source.name}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Rubriques */}
          <div>
            <h4 className="font-semibold mb-4 text-[#ff6b35]">Rubriques</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Politique</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Économie</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Sport</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Culture</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Société</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">International</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Environnement</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Technologie</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-[#ff6b35]">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-[#ff6b35]" />
                <span>Antananarivo, Madagascar</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-5 h-5 text-[#ff6b35]" />
                <a href="mailto:contact@mada-flash.mg" className="hover:text-white transition-colors">
                  contact@mada-flash.mg
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-5 h-5 text-[#ff6b35]" />
                <a href="tel:+261340000000" className="hover:text-white transition-colors">
                  +261 34 00 000 00
                </a>
              </li>
            </ul>

            {/* Download App */}
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-2">Téléchargez notre app</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition-colors">
                  App Store
                </button>
                <button className="px-4 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition-colors">
                  Play Store
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <span>© {currentYear} Mada-Flash.mg</span>
              <span>•</span>
              <span>Fait avec</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>à Madagascar</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
            </div>
          </div>

          {/* Transparency Notice */}
          <div className="mt-4 p-4 bg-white/5 rounded-xl text-xs text-gray-500 text-center space-y-3">
            <div>
              <strong className="text-gray-400">Transparence :</strong> Mada-Flash.mg est une plateforme d'agrégation.
              Nous ne produisons pas de contenu original. Chaque information est sourcée et liée à son média d'origine.
              Tous les droits appartiennent à leurs propriétaires respectifs.
            </div>
            <div className="border-t border-white/10 pt-3">
              <strong className="text-gray-400">Images :</strong> Les images d'illustration affichées sur ce site sont
              générées par intelligence artificielle (Google Gemini AI) afin d'illustrer le sujet des articles de manière
              cohérente et respectueuse. Ces images ne représentent pas des personnes réelles et sont créées uniquement
              à des fins d'illustration éditoriale.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
