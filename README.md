# NanoKineticsDB (Public Beta)

🌐 **Live Portal:** 

## About The Project
**NanoKineticsDB** is a specialized Database Management System (DBMS) designed to centralize and standardize kinetic data for nanozymes. Nanozymes are artificial nanomaterials exhibiting enzyme-like characteristics. Understanding their catalytic efficiency—specifically measured through Michaelis-Menten kinetic parameters like maximum velocity (Vmax) and binding affinity (Km)—is critical for advancing biotechnology, targeted drug delivery, and environmental remediation. 

Currently, this vital physical and chemical data is often fragmented across individual research papers and isolated spreadsheets. This project solves that fragmentation by providing a unified, transactional repository built on a robust, scalable 3-Tier Web Architecture.

### System Architecture
* **Data Layer (MySQL):** A relational database ensuring structural integrity and strict normalization. It elegantly captures the complex many-to-many relationships between nanomaterials, physical shapes, chemical substrates (like TMB or H2O2), and kinetic behaviors under varying pH and temperature conditions.
* **Application Layer (Node.js & Express):** A secure REST API that handles all data transactions, routing, and submission filtering.
* **Presentation Layer (HTML/CSS/JS):** A lightweight, highly responsive client interface featuring an interactive search engine and secure data submission portal.

## 🤝 Community Contribution (Beta Phase)
We are currently operating in an open beta phase. Our goal is to build the most comprehensive, reliable open-access database for the global nanozyme research community. 

**You can help us grow!** Researchers and developers are highly encouraged to submit their verified experimental kinetic data through our live web portal. 

To maintain the highest level of scientific accuracy, all community submissions are routed to a secure "Pending" queue. Our curation team manually reviews each entry for validity before it is officially approved and merged into the live global database. 

## ⚠️ License & Copyright (All Rights Reserved)
Please note that while the data gathered by this project is intended to benefit the community, **the underlying source code is proprietary.** 

The code in this repository is provided strictly for educational viewing, transparency, and portfolio demonstration. **All rights are reserved.** Modification, redistribution, cloning, or independent hosting of this software is strictly prohibited without explicit written permission from the authors. 

The scientific community is welcome and encouraged to interact with the platform entirely through the official live web portal linked at the top of this document.

---
*Developed by Divyanshu and Adarsh @ JIIT Noida (2026).*
