const COLUMNS: { title: string; links: string[] }[] = [
  { title: "Actions", links: ["Summarist Magazine", "Cancel Subscription", "Help", "Contact us"] },
  { title: "Useful Links", links: ["Pricing", "Summarist Business", "Gift Cards", "Authors & Publishers"] },
  { title: "Company", links: ["About", "Careers", "Partners", "Code of Conduct"] },
  { title: "Other", links: ["Sitemap", "Legal Notice", "Terms of Service", "Privacy Policies"] },
];

export default function Footer() {
  return (
    <section id="footer">
      <div className="container">
        <div className="row">
          <div className="footer__top--wrapper">
            {COLUMNS.map((column) => (
              <div className="footer__block" key={column.title}>
                <div className="footer__link--title">{column.title}</div>
                <div>
                  {column.links.map((link) => (
                    <div className="footer__link--wrapper" key={link}>
                      <span className="footer__link">{link}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="footer__copyright--wrapper">
            <div className="footer__copyright">Copyright &copy; 2023 Summarist.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
