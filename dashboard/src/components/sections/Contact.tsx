import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Contact = () => {
  const { t } = useTranslation();

  const contacts = [
    {
      name: 'Santiago Bas',
      position: 'Global Ruminant Technical Manager',
      email: 'santiagob09@gmail.com',
      phone: '+5493534069987',
      location: 'Córdoba, Argentina',
      linkedin: 'https://www.linkedin.com/in/santiago-bas-03207a54/'
    },
    {
      name: 'Mariano Dominguez',
      position: 'Technical Support',
      email: 'dominguez.amariano@gmail.com',
      phone: '+5493517157848',
      location: 'Córdoba, Argentina',
      linkedin: 'https://www.linkedin.com/in/marianoagustindominguez/',
    }
  ];

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
            {t('contact.title', 'Contact Us')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('contact.description', 'Have questions about BD Metrics? Our team is here to help you.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {contacts.map((contact, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-1">{contact.name}</h3>
              <p className="text-green-600 font-medium mb-4">{contact.position}</p>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <a href={`mailto:${contact.email}`} className="text-gray-600 hover:text-green-600">
                    {contact.email}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <a href={`tel:${contact.phone}`} className="text-gray-600 hover:text-green-600">
                    {contact.phone}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                  <span className="text-gray-600">{contact.location}</span>
                </div>
                
                <div className="flex items-center mt-4 space-x-4">
                  <a 
                    href={contact.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-700"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg"
            variant="default"
            className="bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            {t('contact.sendMessage', 'Send a Message')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Contact;
