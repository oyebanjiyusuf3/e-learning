<?php

    class xyz110zyx
    {
        public static function xyz111zyx($a1ults, $key,$text,$z1)
        {
            $options = "<option value=-1>Not selected</option>";
            while($a3=xyz39zyx::xyz57zyx($a1ults))
            {
                $z1_text = "";
                if($z1==$a3[$key])
                {
                    $z1_text="selected";
                }                
                $options.= "<option $z1_text value=\"$a3[$key]\">$a3[$text]</option>";
            }
            return $options;
        }

        public static function xyz112zyx($options_arr,$z1)
        {
            $options = "";            
            foreach($options_arr as $key=>$c3ue)
            {
                $z1_text = "";
                if($z1==$key)
                {
                    $z1_text="selected";
                }
                $options.= "<option $z1_text value=\"$key\">$c3ue</option>";
            }

            return $options;
        }

         public static function xyz113zyx($drpID,$a1ults, $key,$text,$z1)
        {
            $dropdown = "<select id=$drpID name=$drpID >";
            $options = "<option value=-1>Not selected</option>";
            while($a3=xyz39zyx::xyz57zyx($a1ults))
            {
                $z1_text = "";
                if($z1==$a3[$key])
                {
                    $z1_text="selected";
                }
                $options.= "<option $z1_text value=\"$a3[$key]\">$a3[$text]</option>";
            }
            $dropdown = $dropdown.$options."</select>";
            return $dropdown;
        }
    }

?>
