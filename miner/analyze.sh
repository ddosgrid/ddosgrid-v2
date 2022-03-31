for file in /mnt/c/users/david/documents/uni/bachelorarbeit/dataset/BenignDoH-Pcaps/Firefox/AdGuard/*pcap;
do
  echo $file
  node index.js pcap_path=$file
done