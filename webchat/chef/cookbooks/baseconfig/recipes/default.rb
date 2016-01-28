# Base configuration recipe in Chef.
package "wget"
package "ntp"

cookbook_file "ntp.conf" do
  path "/etc/ntp.conf"
end
execute 'ntp_restart' do
  command 'service ntp restart'
end

package "apache2"
cookbook_file "000-default.conf" do
  path "/etc/apache2/sites-enabled/000-default.conf"
end
service "apache2" do
	action:restart
end

package "build-essential"

package "git"

execute "curl --silent --location https://deb.nodesource.com/setup_0.12 | sudo bash -" do

end

execute "sudo apt-get install --yes nodejs" do

end

execute "node --version" do

end

execute "sudo npm install -g npm" do

end

execute "sudo npm install -g nodemon" do

end

execute "sudo npm install mongoose -g --save " do

end

execute "export PATH=\"$PATH:$HOME/npm/bin\"" do

end
execute "export PATH=\"$PATH:$usr/npm/bin\"" do

end
execute "export PATH=\"$PATH:$HOME/usr/npm/bin\"" do

end
execute "export NODE_PATH=/usr/local/lib/node_modules" do

end
execute "export NODE_PATH=/usr/lib/node_modules" do

end

execute "sudo npm install serve-favicon -g" do

end

execute "sudo npm install morgan -g" do

end

execute "sudo npm install cookie-parser -g" do

end

execute "sudo npm install body-parser -g" do

end

execute "sudo npm install jade -g" do

end


execute "sudo npm install debug -g" do

end

execute "sudo npm install express -g" do

end

execute "sudo npm install compression -g" do

end

execute "sudo npm install cors -g" do

end

execute "sudo npm install dotenv -g" do

end

execute "sudo npm install errorhandler -g" do

end

execute "sudo npm install express-jwt -g" do

end

execute "sudo npm install jsonwebtoken -g" do

end

execute "sudo npm install lodash -g" do

end

execute "sudo npm install mongoose-unique-validator -g --force" do

end
execute "sudo npm install bcrypt -g --force" do

end



